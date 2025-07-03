# 當發生錯誤時終止腳本
set -e

# 清除舊的構建文件
rm -rf dist/

# 打包/構建
npm run build
# 移動至到打包後的dist目錄
# 進入構建文件夾
cd dist

# 創建 .nojekyll 檔案（確保 GitHub Pages 不會忽略以下划線開頭的文件）
touch .nojekyll

# 初始化 git 並提交
git init
git add -A
git commit -m 'deploy'

# 強制推送到 gh-pages 分支
#將dist資料夾中的內容推送至遠端的gh-pages分支中，並強制無條件將舊有的內容取代成目前的內容（指令 git push -f)
git push -f https://github.com/fortes1219/vue3_typescript.git HEAD:gh-pages

# 回到上一層目錄
cd -