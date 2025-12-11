import { ReportGenerator } from './logic.js';

const { createApp, ref } = Vue;

const app = createApp({
    setup() {
        const isDragging = ref(false);
        const reportHtml = ref('');
        const fileInput = ref(null);
        const generator = new ReportGenerator();
        let templateContent = '';

        // Load template on mount
        fetch('template.html')
            .then(res => res.text())
            .then(text => {
                templateContent = text;
            })
            .catch(err => console.error('Failed to load template:', err));

        const triggerFileInput = () => {
            fileInput.value.click();
        };

        const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (file) processFile(file);
        };

        const handleDrop = (e) => {
            isDragging.value = false;
            const file = e.dataTransfer.files[0];
            if (file) processFile(file);
        };

        const processFile = (file) => {
            if (!file.name.endsWith('.csv')) {
                alert('请上传 CSV 文件');
                return;
            }

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    try {
                        const data = results.data;
                        if (!data || data.length === 0) {
                            alert('CSV 文件为空或格式不正确');
                            return;
                        }

                        // Generate Report Data
                        // Default to week 49 as per template, or calculate from date?
                        // For now use 49 to match template default
                        const reportData = generator.processData(data, 49);

                        // Inject into template
                        if (!templateContent) {
                            alert('模板文件尚未加载完成，请稍后再试');
                            return;
                        }

                        const dataJson = JSON.stringify(reportData, null, 2);
                        const injectedHtml = templateContent.replace(
                            '// INJECT_DATA_HERE',
                            `const DATA = ${dataJson};`
                        );

                        reportHtml.value = injectedHtml;
                    } catch (e) {
                        console.error(e);
                        alert('生成报告出错: ' + e.message);
                    }
                },
                error: (err) => {
                    alert('解析 CSV 出错: ' + err.message);
                }
            });
        };

        const reset = () => {
            reportHtml.value = '';
            if (fileInput.value) fileInput.value.value = '';
        };

        return {
            isDragging,
            reportHtml,
            fileInput,
            triggerFileInput,
            handleFileChange,
            handleDrop,
            reset
        };
    }
});

app.mount('#app');
