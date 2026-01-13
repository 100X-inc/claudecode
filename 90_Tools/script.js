// DOM要素の取得
const searchButton = document.getElementById('searchButton');
const searchKeyword = document.getElementById('searchKeyword');
const excludeSNS = document.getElementById('excludeSNS');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const error = document.getElementById('error');
const resultsTable = document.getElementById('resultsTable').querySelector('tbody');
const searchDate = document.getElementById('searchDate');
const copyTable = document.getElementById('copyTable');
const downloadCSV = document.getElementById('downloadCSV');

// SNSドメインのリスト
const SNS_DOMAINS = [
    'twitter.com', 'x.com', 'facebook.com', 'instagram.com', 
    'linkedin.com', 'youtube.com', 'tiktok.com', 'pinterest.com'
];

// モックデータ（実際のAPIがない場合のサンプルデータ）
const mockResults = [
    {
        title: "生成AI活用事例 | 業務効率化からクリエイティブまで",
        description: "生成AIの最新活用事例を紹介。ChatGPTやStable Diffusionなどを使った業務効率化、コンテンツ作成、データ分析など実践的な導入例を解説します。",
        url: "https://example-ai-blog.com/generative-ai-cases"
    },
    {
        title: "【2025年版】生成AI活用事例30選 - 企業の成功パターン",
        description: "大手企業から中小企業まで、生成AIを活用した成功事例を30個厳選してご紹介。導入効果や具体的な使い方、ROIなどを詳しく解説。",
        url: "https://tech-media.jp/ai-case-studies-2025"
    },
    {
        title: "生成AIで変わる仕事の未来 - 活用事例と導入ガイド",
        description: "生成AI技術がもたらす業務変革の事例集。マーケティング、カスタマーサポート、開発業務での実践例と導入のポイントを専門家が解説。",
        url: "https://business-ai.net/future-work-with-ai"
    },
    {
        title: "製造業における生成AI活用事例 - 品質向上と効率化",
        description: "製造業界での生成AI導入事例を紹介。品質検査の自動化、生産計画の最適化、予知保全など、現場で実証された活用方法を解説します。",
        url: "https://manufacturing-dx.com/ai-cases"
    },
    {
        title: "医療分野の生成AI活用事例 - 診断支援から創薬まで",
        description: "医療・ヘルスケア領域における生成AIの革新的な活用事例。画像診断支援、カルテ作成効率化、新薬開発での応用例を医療従事者向けに解説。",
        url: "https://medical-ai-journal.jp/case-studies"
    }
];

// 検索機能
async function performSearch() {
    const keyword = searchKeyword.value.trim();
    if (!keyword) {
        alert('検索キーワードを入力してください');
        return;
    }

    // UI状態の更新
    loading.classList.remove('hidden');
    results.classList.add('hidden');
    error.classList.add('hidden');

    try {
        // 実際のAPIを使用する場合はここでfetchを行う
        // const response = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`);
        // const data = await response.json();
        
        // モックデータを使用（デモ用）
        await new Promise(resolve => setTimeout(resolve, 1500)); // 検索をシミュレート
        
        let searchResults = [...mockResults];
        
        // SNS除外処理
        if (excludeSNS.checked) {
            searchResults = searchResults.filter(result => {
                const url = new URL(result.url);
                return !SNS_DOMAINS.some(domain => url.hostname.includes(domain));
            });
        }

        // 結果を表示
        displayResults(searchResults.slice(0, 10));
        
    } catch (err) {
        console.error('検索エラー:', err);
        error.classList.remove('hidden');
    } finally {
        loading.classList.add('hidden');
    }
}

// 結果表示
function displayResults(searchResults) {
    resultsTable.innerHTML = '';
    
    searchResults.forEach((result, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${escapeHtml(result.title)}</td>
            <td>${escapeHtml(result.description)}</td>
            <td><a href="${result.url}" target="_blank" rel="noopener">${result.url}</a></td>
        `;
        resultsTable.appendChild(row);
    });

    // 検索日時を設定
    const now = new Date();
    const dateStr = now.toLocaleString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
    });
    searchDate.textContent = `検索日時: ${dateStr}`;

    results.classList.remove('hidden');
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Markdown形式でテーブルをコピー
function copyTableAsMarkdown() {
    const rows = resultsTable.querySelectorAll('tr');
    let markdown = '| Rank | Title | Description | URL |\n';
    markdown += '| ---- | ----- | ----------- | --- |\n';
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length) {
            markdown += `| ${cells[0].textContent} | ${cells[1].textContent} | ${cells[2].textContent} | ${cells[3].querySelector('a').href} |\n`;
        }
    });
    
    markdown += `\n${searchDate.textContent}`;
    
    navigator.clipboard.writeText(markdown).then(() => {
        alert('表をMarkdown形式でコピーしました');
    }).catch(err => {
        console.error('コピーエラー:', err);
        alert('コピーに失敗しました');
    });
}

// CSV形式でダウンロード
function downloadAsCSV() {
    const rows = resultsTable.querySelectorAll('tr');
    let csv = 'Rank,Title,Description,URL\n';
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length) {
            csv += `${cells[0].textContent},"${cells[1].textContent}","${cells[2].textContent}",${cells[3].querySelector('a').href}\n`;
        }
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `seo_research_${searchKeyword.value}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// イベントリスナー
searchButton.addEventListener('click', performSearch);
searchKeyword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});
copyTable.addEventListener('click', copyTableAsMarkdown);
downloadCSV.addEventListener('click', downloadAsCSV);