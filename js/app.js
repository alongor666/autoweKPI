import { ReportGenerator } from './logic.js';

const { createApp, ref } = Vue;

const app = createApp({
    setup() {
        const isDragging = ref(false);
        const reportHtml = ref('');
        const fileInput = ref(null);
        const isProcessing = ref(false);
        const error = ref('');
        const generator = new ReportGenerator();
        let templateContent = '';

        // Load template on mount
        fetch('template.html')
            .then(res => res.text())
            .then(text => {
                templateContent = text;
            })
            .catch(err => {
                console.error('Failed to load template:', err);
                error.value = '模板加载失败，请刷新页面重试';
            });

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
            error.value = '';
            
            if (!file.name.endsWith('.csv')) {
                error.value = '请上传 CSV 文件';
                return;
            }

            isProcessing.value = true;

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    try {
                        const data = results.data;
                        if (!data || data.length === 0) {
                            throw new Error('CSV 文件为空或格式不正确');
                        }

                        // Generate Report Data
                        const reportData = generator.processData(data, 49);

                        // Inject into template
                        if (!templateContent) {
                            throw new Error('模板文件尚未加载完成，请稍后再试');
                        }

                        const dataJson = JSON.stringify(reportData, null, 2);
                        const injectedHtml = templateContent.replace(
                            '// INJECT_DATA_HERE',
                            `const DATA = ${dataJson};`
                        );

                        reportHtml.value = injectedHtml;
                    } catch (e) {
                        console.error(e);
                        error.value = '生成报告出错: ' + e.message;
                    } finally {
                        isProcessing.value = false;
                    }
                },
                error: (err) => {
                    error.value = '解析 CSV 出错: ' + err.message;
                    isProcessing.value = false;
                }
            });
        };

        const reset = () => {
            reportHtml.value = '';
            error.value = '';
            isProcessing.value = false;
            if (fileInput.value) fileInput.value.value = '';
        };

        return {
            isDragging,
            reportHtml,
            fileInput,
            isProcessing,
            error,
            triggerFileInput,
            handleFileChange,
            handleDrop,
            reset
        };
    }
});

app.mount('#app');
