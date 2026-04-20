# GasGx Chatbot Knowledge Base

## Scope

This layer upgrades the site chatbot from a prompt-only assistant into a three-part flow:

1. `Policy rules`
   Deterministic FAQ rules for high-frequency sales questions.
2. `Knowledge retrieval`
   `knowledge_documents` + `knowledge_chunks` drive RAG-style context retrieval.
3. `QA and training`
   `chat_qa_logs` and `chat_lead_intents` capture outcomes for feedback and follow-up.

## Supabase objects

- `public.knowledge_documents`
- `public.knowledge_chunks`
- `public.chat_faq_rules`
- `public.chat_qa_logs`
- `public.chat_lead_intents`
- `public.search_knowledge_chunks(search_term, search_language, result_limit)`

Migration:

- [20260420160000_chat_knowledge_rag.sql](/D:/code/GasGx/supabase/migrations/20260420160000_chat_knowledge_rag.sql)

## Admin pages

New AMS pages under `System`:

- `Knowledge`
  Manual document and FAQ rule management.
- `Ingestion`
  Crawl allowed sitemap sections or manual URLs and write them into the knowledge tables.
- `Chat QA`
  Review logs, mark feedback status, inspect lead-intent rows, and create FAQ drafts from good answers.

Entry module:

- [chat-knowledge-admin.module.js](/D:/code/GasGx/article_management/modules/chat-knowledge-admin.module.js)

## Chat flow

`site-chat` now runs in this order:

1. Detect language and session metadata.
2. Try published FAQ rules.
3. Search `knowledge_chunks`.
4. Build a grounded system prompt with sources.
5. Generate through XFYUN Spark.
6. Return `sources` + `handoff`.
7. Store QA logs and lead-intent rows.

Function entry:

- [site-chat/index.ts](/D:/code/GasGx/supabase/functions/site-chat/index.ts)

## Notes

- The frontend chat widget now sends `sessionId`, `history`, and `pageContext`.
- The widget can display returned `sources` and `handoff.next_fields`.
- Ingestion is currently browser-admin driven, not a separate edge function.
