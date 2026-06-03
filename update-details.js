const fs = require('fs');
const path = require('path');

const DETAIL_DIR = path.join(__dirname, 'assets', 'detail');
const HTML_FILE = path.join(__dirname, 'index.html');

// 1. 读取 assets/detail/ 下的所有图片
let files = [];
try {
    files = fs.readdirSync(DETAIL_DIR)
        .filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
} catch (err) {
    console.error('❌ 无法读取 assets/detail/ 目录:', err.message);
    process.exit(1);
}

// 2. 按前缀分组（如 zx-1-1-1.png / zx-1-1-2.png => 前缀 zx-1-1）
const groups = {};
files.forEach(file => {
    // 匹配形如 zx-1-1-1.png 或 intern-1-1-1.png 的文件
    const match = file.match(/^([a-z]+-\d+-\d+)-(\d+)\.(png|jpg|jpeg|webp|gif)$/i);
    if (!match) {
        console.log(`⚠️  跳过不符合命名规则的文件: ${file}`);
        return;
    }
    const prefix = match[1].toLowerCase(); // 如 "zx-1-1"
    if (!groups[prefix]) groups[prefix] = [];
    groups[prefix].push(`detail/${file}`);
});

console.log('识别到的图片分组:');
Object.keys(groups).sort().forEach(k => {
    console.log(`  ${k}: ${groups[k].length} 张`);
});

// 3. 读取 index.html
let html = fs.readFileSync(HTML_FILE, 'utf8');

// 4. 遍历每个 article.portfolio-card，找到其内部的卡片预览图，匹配 groups
// 策略：找到 <article class="portfolio-card..."> 到 </article> 之间的内容，
// 提取第一个 src="assets/xxx.png"（排除 deco- 和 icon- 开头的装饰图）
const articleRegex = /<article\s+class="([^"]*portfolio-card[^"]*)"/gi;
let match;
let replacements = 0;
let lastIndex = 0;

while ((match = articleRegex.exec(html)) !== null) {
    const classAttr = match[1];
    const tagStart = match.index;
    const afterClass = html.indexOf('>', tagStart) + 1;
    
    // 找到这个 article 的结束标签
    let depth = 1;
    let searchPos = afterClass;
    let endPos = -1;
    while (searchPos < html.length && depth > 0) {
        const nextOpen = html.indexOf('<article', searchPos);
        const nextClose = html.indexOf('</article>', searchPos);
        
        if (nextClose === -1) break;
        if (nextOpen !== -1 && nextOpen < nextClose) {
            depth++;
            searchPos = nextOpen + 8;
        } else {
            depth--;
            if (depth === 0) endPos = nextClose;
            searchPos = nextClose + 10;
        }
    }
    
    if (endPos === -1) continue;
    
    const articleContent = html.slice(afterClass, endPos);
    
    // 跳过视频卡片（有 data-video 的）
    if (articleContent.includes('data-video=') || classAttr.includes('data-video')) {
        // 检查是否在标签内已经有 data-video（可能在 class 属性后面）
        const tagPart = html.slice(tagStart, afterClass);
        if (tagPart.includes('data-video=')) continue;
    }
    
    // 在这个 article 内部找第一个有效的卡片预览图
    // 排除装饰图：deco-*, icon-*, bg_* 等
    const imgMatches = articleContent.matchAll(/<img[^>]+src=["']assets\/([^"']+)["']/gi);
    let prefix = null;
    
    for (const imgMatch of imgMatches) {
        const srcPath = imgMatch[1].toLowerCase();
        const fileName = path.basename(srcPath, path.extname(srcPath));
        
        // 跳过装饰图
        if (fileName.startsWith('deco-') || 
            fileName.startsWith('icon-') || 
            fileName.startsWith('bg_') ||
            fileName.startsWith('plane') ||
            fileName.startsWith('cloud')) {
            continue;
        }
        
        // 检查这个前缀是否在 groups 中
        if (groups[fileName]) {
            prefix = fileName;
            break;
        }
    }
    
    if (!prefix) {
        console.log(`⚠️  未找到匹配的图片组 for article at pos ${tagStart}`);
        continue;
    }
    
    const detailValue = groups[prefix].join(',');
    
    // 替换或插入 data-detail
    const tagEnd = html.indexOf('>', tagStart);
    const fullTag = html.slice(tagStart, tagEnd + 1);
    
    let newTag;
    if (fullTag.includes('data-detail=')) {
        newTag = fullTag.replace(/\sdata-detail="[^"]*"/, ` data-detail="${detailValue}"`);
    } else {
        // 在 > 前插入 data-detail
        newTag = fullTag.replace(/>$/, ` data-detail="${detailValue}">`);
    }
    
    if (newTag !== fullTag) {
        html = html.slice(0, tagStart) + newTag + html.slice(tagEnd + 1);
        replacements++;
        // 调整正则的 lastIndex
        articleRegex.lastIndex = tagStart + newTag.length;
        console.log(`✅ 更新卡片: ${prefix} -> ${groups[prefix].length} 张图`);
    }
}

fs.writeFileSync(HTML_FILE, html);
console.log(`\n✅ 成功更新 ${replacements} 个卡片的 data-detail 属性`);

if (replacements === 0) {
    console.log('\n💡 排查建议:');
    console.log('   1. 检查 assets/detail/ 下的文件名是否符合 "前缀-序号.扩展名" 格式');
    console.log('   2. 检查卡片预览图的 src 是否和 detail 文件夹里的前缀一致');
    console.log('   3. 例如: 卡片预览图 assets/zx-1-1.png 对应 detail/zx-1-1-1.png, detail/zx-1-1-2.png...');
}