@echo off
echo 正在扫描更改...
git add .
echo 正在保存版本...
set /p msg="请输入修改备注 (直接回车默认update): "
if "%msg%"=="" set msg="auto update"
git commit -m "%msg%"
echo 正在上传到 GitHub...
git push
echo 完成！您的网站即将更新。
pause