import type { Page } from '@playwright/test';

type BootstrapParams = {
  dealId: string;
  customerId: string;
  customerEmail: string;
};

type BootstrapResult = {
  instanceId: string;
  currentStage: string;
  confirmStageSlug: string;
  confirmStageToken: string;
};

export async function bootstrapDealToQuoteConfirmed(
  page: Page,
  params: BootstrapParams,
): Promise<BootstrapResult> {
  return page.evaluate(async ({ dealId, customerId, customerEmail }) => {
    const text = (value: unknown, fallback = '') => {
      const normalized = value == null ? '' : String(value).trim();
      return normalized || fallback;
    };
    const obj = (value: unknown, fallback: Record<string, unknown> = {}) => (
      value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : fallback
    );
    const arr = (value: unknown) => (Array.isArray(value) ? value : []);
    const slug = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const looksLikeMissingColumnError = (error: any, columnName: string) => {
      const message = text(error?.message || error?.details || error?.hint).toLowerCase();
      if (!message) return false;
      return message.includes(columnName.toLowerCase()) && message.includes('quote_deal_stage_records');
    };

    const createClient = (window as any)?.supabase?.createClient;
    if (typeof createClient !== 'function') {
      throw new Error('Supabase client unavailable in page context.');
    }
    const url = (window as any).AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
    const key = (window as any).AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
    const client = createClient(url, key);

    const { data: deal, error: dealError } = await client
      .from('quote_deals')
      .select('*')
      .eq('id', dealId)
      .single();
    if (dealError || !deal) {
      throw new Error(`Load deal failed: ${dealError?.message || 'deal missing'}`);
    }

    const resolvedCustomerId = text(customerId || deal.customer_id);
    if (!resolvedCustomerId) {
      throw new Error('Missing customer id for quote bootstrap.');
    }

    const { data: customer, error: customerError } = await client
      .from('quote_customers')
      .select('*')
      .eq('id', resolvedCustomerId)
      .single();
    if (customerError || !customer) {
      throw new Error(`Load customer failed: ${customerError?.message || 'customer missing'}`);
    }

    let requirementId = text(deal.primary_requirement_id);
    if (!requirementId) {
      const { data: requirementRows, error: requirementError } = await client
        .from('quote_requirements')
        .select('id')
        .eq('deal_id', dealId)
        .order('updated_at', { ascending: false })
        .limit(1);
      if (requirementError) throw requirementError;
      requirementId = text(requirementRows?.[0]?.id);
    }

    const receiverEmail = text(customer.email, text(customerEmail)).toLowerCase();
    if (!receiverEmail) {
      throw new Error('Customer email is empty, cannot bootstrap quote instance.');
    }

    let instance = null as any;
    const { data: existingInstances, error: existingError } = await client
      .from('quote_instances')
      .select('*')
      .eq('deal_id', dealId)
      .order('updated_at', { ascending: false })
      .limit(1);
    if (existingError) throw existingError;
    instance = existingInstances?.[0] || null;

    let template = null as any;
    if (!instance) {
      const { data: templateInstances, error: templateError } = await client
        .from('quote_instances')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1);
      if (templateError) throw templateError;
      template = templateInstances?.[0] || null;

      if (!template) {
        const { data: products, error: productError } = await client
          .from('quote_products')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
          .limit(1);
        if (productError) throw productError;
        const product = products?.[0];
        if (!product?.id || !product?.brand_id) {
          throw new Error('No active quote product template found.');
        }
        const { data: brands, error: brandError } = await client
          .from('quote_brands')
          .select('*')
          .eq('id', product.brand_id)
          .limit(1);
        if (brandError) throw brandError;
        const brand = brands?.[0] || {};
        template = {
          brand_id: product.brand_id,
          product_id: product.id,
          default_lang: text(product.default_lang, 'zh'),
          validity_hours: Number(product.validity_hours) || 72,
          draft_rates: obj(product.default_rates, {}),
          share_config: {},
          brand_snapshot: {
            brand_name: text(brand.brand_name),
            display_name: text(brand.display_name),
            overview_title: obj(brand.overview_title, {}),
            footer_note: obj(brand.footer_note, {}),
          },
          product_snapshot: {
            public_title: obj(product.public_title, { zh: 'E2E Quote', en: 'E2E Quote' }),
            default_lang: text(product.default_lang, 'zh'),
            default_rates: obj(product.default_rates, {}),
            section_config: arr(product.section_config),
          },
          section_config: arr(product.section_config),
        };
      }

      const createdAt = new Date().toISOString();
      const insertPayload = {
        brand_id: text(template.brand_id),
        product_id: text(template.product_id),
        public_slug: slug('e2e'),
        status: 'draft',
        last_active_status: 'draft',
        customer_id: resolvedCustomerId,
        deal_id: dealId,
        requirement_id: requirementId || null,
        customer_name: text(customer.company_name, text(customer.contact_name, 'E2E Customer')),
        receiver_name: text(customer.contact_name, 'E2E Contact'),
        receiver_email: receiverEmail,
        default_lang: text(template.default_lang, 'zh'),
        validity_hours: Number(template.validity_hours) || 72,
        draft_rates: obj(template.draft_rates, {}),
        share_config: obj(template.share_config, {}),
        customer_snapshot: {
          company_name: text(customer.company_name),
          contact_name: text(customer.contact_name),
          email: receiverEmail,
          phone: text(customer.phone),
          country: text(customer.country),
          notes: text(customer.notes),
        },
        brand_snapshot: obj(template.brand_snapshot, {}),
        product_snapshot: obj(template.product_snapshot, { public_title: { zh: 'E2E Quote', en: 'E2E Quote' } }),
        section_config: arr(template.section_config),
        published_snapshot: null,
        published_at: null,
        created_at: createdAt,
      };
      const { data: inserted, error: insertError } = await client
        .from('quote_instances')
        .insert(insertPayload)
        .select('*')
        .single();
      if (insertError || !inserted) {
        throw new Error(`Create quote instance failed: ${insertError?.message || 'insert error'}`);
      }
      instance = inserted;
    }

    const nextPatch: Record<string, unknown> = {};
    if (!text(instance.public_slug)) nextPatch.public_slug = slug('e2e');
    if (text(instance.deal_id) !== dealId) nextPatch.deal_id = dealId;
    if (text(instance.customer_id) !== resolvedCustomerId) nextPatch.customer_id = resolvedCustomerId;
    if (requirementId && text(instance.requirement_id) !== requirementId) nextPatch.requirement_id = requirementId;
    if (text(instance.receiver_email).toLowerCase() !== receiverEmail) nextPatch.receiver_email = receiverEmail;
    if (!text(instance.customer_name)) nextPatch.customer_name = text(customer.company_name, text(customer.contact_name, 'E2E Customer'));
    if (!text(instance.receiver_name)) nextPatch.receiver_name = text(customer.contact_name, 'E2E Contact');
    if (!text(instance.default_lang)) nextPatch.default_lang = 'zh';
    if (!Number.isFinite(Number(instance.validity_hours))) nextPatch.validity_hours = 72;
    if (!(instance.draft_rates && typeof instance.draft_rates === 'object' && !Array.isArray(instance.draft_rates))) {
      nextPatch.draft_rates = {};
    }
    if (!(instance.brand_snapshot && typeof instance.brand_snapshot === 'object' && !Array.isArray(instance.brand_snapshot))) {
      nextPatch.brand_snapshot = obj(template?.brand_snapshot, {});
    }
    const productSnapshot = obj(instance.product_snapshot, obj(template?.product_snapshot, {}));
    const publicTitle = obj(productSnapshot.public_title, {});
    if (!Object.keys(publicTitle).length) {
      nextPatch.product_snapshot = {
        ...productSnapshot,
        public_title: { zh: 'E2E Quote', en: 'E2E Quote' },
      };
    }
    if (!Array.isArray(instance.section_config)) {
      nextPatch.section_config = arr(template?.section_config);
    }
    const shareConfig = obj(instance.share_config, {});
    if (!text(shareConfig.recipient_email)) {
      nextPatch.share_config = {
        ...shareConfig,
        recipient_email: receiverEmail,
      };
    }
    if (!(instance.customer_snapshot && typeof instance.customer_snapshot === 'object' && !Array.isArray(instance.customer_snapshot))) {
      nextPatch.customer_snapshot = {
        company_name: text(customer.company_name),
        contact_name: text(customer.contact_name),
        email: receiverEmail,
        phone: text(customer.phone),
        country: text(customer.country),
        notes: text(customer.notes),
      };
    }

    if (Object.keys(nextPatch).length) {
      const { data: patched, error: patchError } = await client
        .from('quote_instances')
        .update(nextPatch)
        .eq('id', instance.id)
        .select('*')
        .single();
      if (patchError || !patched) {
        throw new Error(`Patch quote instance failed: ${patchError?.message || 'patch error'}`);
      }
      instance = patched;
    }

    const ownerName = text(deal.owner_name, 'sales');
    const ownerEmail = text(deal.owner_email, receiverEmail);
    const completedAt = new Date().toISOString();
    let confirmStageSlug = '';
    let confirmStageToken = '';
    let stagePublicColumnsSupported = true;

    const { data: existingConfirmRows, error: existingConfirmError } = await client
      .from('quote_deal_stage_records')
      .select('id, stage_key, public_slug, public_token')
      .eq('deal_id', dealId)
      .eq('stage_key', 'quote_confirmed')
      .limit(1);
    if (existingConfirmError) {
      if (looksLikeMissingColumnError(existingConfirmError, 'public_slug') || looksLikeMissingColumnError(existingConfirmError, 'public_token')) {
        stagePublicColumnsSupported = false;
      } else {
        throw existingConfirmError;
      }
    } else {
      confirmStageSlug = text(existingConfirmRows?.[0]?.public_slug);
      confirmStageToken = text(existingConfirmRows?.[0]?.public_token);
    }
    if (!confirmStageSlug) confirmStageSlug = slug('stage-quote-confirmed');
    if (!confirmStageToken) confirmStageToken = slug('token').replace('token-', '');

    const stageRows = [
      { deal_id: dealId, stage_key: 'customer_profile', stage_status: 'completed', owner_name: ownerName, owner_email: ownerEmail, completed_at: completedAt },
      { deal_id: dealId, stage_key: 'requirement_capture', stage_status: 'completed', owner_name: ownerName, owner_email: ownerEmail, completed_at: completedAt },
      { deal_id: dealId, stage_key: 'requirement_confirmed', stage_status: 'completed', owner_name: ownerName, owner_email: ownerEmail, completed_at: completedAt },
      { deal_id: dealId, stage_key: 'quote_draft', stage_status: 'completed', owner_name: ownerName, owner_email: ownerEmail, completed_at: completedAt },
      stagePublicColumnsSupported
        ? {
          deal_id: dealId,
          stage_key: 'quote_confirmed',
          stage_status: 'active',
          owner_name: ownerName,
          owner_email: ownerEmail,
          completed_at: null,
          public_slug: confirmStageSlug,
          public_token: confirmStageToken,
        }
        : {
          deal_id: dealId,
          stage_key: 'quote_confirmed',
          stage_status: 'active',
          owner_name: ownerName,
          owner_email: ownerEmail,
          completed_at: null,
        },
    ];
    let { error: stageError } = await client
      .from('quote_deal_stage_records')
      .upsert(stageRows, { onConflict: 'deal_id,stage_key' });
    if (stageError && (looksLikeMissingColumnError(stageError, 'public_slug') || looksLikeMissingColumnError(stageError, 'public_token'))) {
      stagePublicColumnsSupported = false;
      ({ error: stageError } = await client
        .from('quote_deal_stage_records')
        .upsert(stageRows.map((row) => {
          const { public_slug, public_token, ...rest } = row as Record<string, unknown>;
          return rest;
        }), { onConflict: 'deal_id,stage_key' }));
    }
    if (stageError) throw stageError;

    if (stagePublicColumnsSupported) {
      const { data: confirmRows, error: confirmError } = await client
        .from('quote_deal_stage_records')
        .select('public_slug, public_token')
        .eq('deal_id', dealId)
        .eq('stage_key', 'quote_confirmed')
        .limit(1);
      if (confirmError) {
        if (!looksLikeMissingColumnError(confirmError, 'public_slug') && !looksLikeMissingColumnError(confirmError, 'public_token')) {
          throw confirmError;
        }
        stagePublicColumnsSupported = false;
      } else {
        confirmStageSlug = text(confirmRows?.[0]?.public_slug, confirmStageSlug);
        confirmStageToken = text(confirmRows?.[0]?.public_token, confirmStageToken);
      }
    } else {
      confirmStageSlug = '';
      confirmStageToken = '';
    }

    const { data: updatedDeal, error: updatedDealError } = await client
      .from('quote_deals')
      .update({
        customer_id: resolvedCustomerId,
        primary_requirement_id: requirementId || null,
        primary_instance_id: instance.id,
        current_stage: 'quote_confirmed',
      })
      .eq('id', dealId)
      .select('id, current_stage, primary_instance_id')
      .single();
    if (updatedDealError || !updatedDeal) {
      throw new Error(`Patch deal failed: ${updatedDealError?.message || 'deal patch error'}`);
    }

    return {
      instanceId: text(updatedDeal.primary_instance_id),
      currentStage: text(updatedDeal.current_stage),
      confirmStageSlug,
      confirmStageToken,
    };
  }, params);
}

export async function forceCustomerQuoteConfirmation(
  page: Page,
  params: { dealId: string; customerEmail: string },
): Promise<void> {
  await page.evaluate(async ({ dealId, customerEmail }) => {
    const text = (value: unknown, fallback = '') => {
      const normalized = value == null ? '' : String(value).trim();
      return normalized || fallback;
    };
    const obj = (value: unknown, fallback: Record<string, unknown> = {}) => (
      value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : fallback
    );

    const createClient = (window as any)?.supabase?.createClient;
    if (typeof createClient !== 'function') {
      throw new Error('Supabase client unavailable in page context.');
    }
    const url = (window as any).AMS_SUPABASE_URL || 'https://mkpcliytqudclkwtewru.supabase.co';
    const key = (window as any).AMS_SUPABASE_KEY || 'sb_publishable_S2uWAddQEXhWJgGeIF_ZbQ_H_thz2hw';
    const client = createClient(url, key);

    const now = new Date().toISOString();
    const { data: stageRows, error: stageError } = await client
      .from('quote_deal_stage_records')
      .select('id, stage_status, completed_at, meta')
      .eq('deal_id', dealId)
      .eq('stage_key', 'quote_confirmed')
      .limit(1);
    if (stageError) throw stageError;
    const stageRow = stageRows?.[0];
    if (!stageRow?.id) throw new Error('quote_confirmed stage row not found for deal.');

    const mergedMeta = {
      ...obj(stageRow.meta, {}),
      public_confirmed_at: now,
      public_confirmation_note: 'Forced customer confirmation fallback from E2E.',
      confirmed_from: 'e2e-fallback',
    };
    const { error: updateStageError } = await client
      .from('quote_deal_stage_records')
      .update({
        stage_status: 'completed',
        completed_at: text(stageRow.completed_at, now),
        meta: mergedMeta,
      })
      .eq('id', stageRow.id);
    if (updateStageError) throw updateStageError;

    const { error: updateDealError } = await client
      .from('quote_deals')
      .update({ current_stage: 'contract_signed' })
      .eq('id', dealId)
      .in('current_stage', ['quote_confirmed', 'contract_signed']);
    if (updateDealError) throw updateDealError;

    const { error: contractStageError } = await client
      .from('quote_deal_stage_records')
      .upsert({
        deal_id: dealId,
        stage_key: 'contract_signed',
        stage_status: 'active',
        meta: {},
      }, { onConflict: 'deal_id,stage_key' });
    if (contractStageError) throw contractStageError;

    const { data: dealRows } = await client
      .from('quote_deals')
      .select('customer_id')
      .eq('id', dealId)
      .limit(1);
    const customerId = text(dealRows?.[0]?.customer_id);
    if (customerId) {
      await client.from('quote_customer_activities').insert({
        customer_id: customerId,
        deal_id: dealId,
        stage_key: 'quote_confirmed',
        actor_type: 'customer',
        actor_id: null,
        actor_label: text(customerEmail, 'customer'),
        activity_type: 'stage_advanced',
        entity_type: 'deal_stage',
        entity_id: stageRow.id,
        page_key: 'account-sales-pipeline',
        action_label: '客户确认报价（E2E fallback）',
        detail_json: {
          summary: 'Customer quote confirmation marked by E2E fallback',
          next_stage: 'contract_signed',
        },
        occurred_at: now,
      });
    }
  }, params);
}
