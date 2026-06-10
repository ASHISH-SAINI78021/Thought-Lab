import React, { useState, useRef } from 'react';
import { getBlogSeriesById } from '../../http';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import styles from './BlogItem/BlogItem.module.css';

const DownloadSeriesPDF = ({ seriesId, seriesTitle }) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const hiddenContainerRef = useRef(null);

    const handleDownload = async () => {
        try {
            setIsDownloading(true);

            // Fetch series with full content for all chapters
            const response = await getBlogSeriesById(seriesId, true);

            if (response?.data?.success && response?.data?.blogs) {
                const chapters = response.data.blogs;

                // Build HTML string for all chapters
                let finalHTML = `
                    <div style="font-family: Arial, sans-serif; padding: 40px; color: #333;">
                        <h1 style="text-align: center; font-size: 36px; margin-bottom: 50px;">${seriesTitle || 'Blog Series'}</h1>
                `;

                chapters.forEach((chapter, idx) => {
                    finalHTML += `
                        <div style="margin-bottom: 60px; page-break-before: always;">
                            <h2 style="font-size: 28px; border-bottom: 2px solid #ccc; padding-bottom: 10px; margin-bottom: 20px;">
                                Chapter ${chapter.chapterNumber ?? idx + 1}: ${chapter.title}
                            </h2>
                            <div style="font-size: 16px; line-height: 1.6;">
                                ${chapter.content || '<p>No content available for this chapter.</p>'}
                            </div>
                        </div>
                    `;
                });

                finalHTML += `</div>`;

                // Inject into hidden container
                const container = hiddenContainerRef.current;
                container.innerHTML = finalHTML;

                // Ensure images within the container are slightly styled
                const imgs = container.querySelectorAll('img');
                imgs.forEach(img => {
                    img.style.maxWidth = '100%';
                    img.style.height = 'auto';
                    img.style.display = 'block';
                    img.style.margin = '20px auto';
                });

                // Wait a moment for any browser rendering
                await new Promise(resolve => setTimeout(resolve, 500));

                // Generate Canvas
                const canvas = await html2canvas(container, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                });

                const imgData = canvas.toDataURL('image/png');

                // Initialize jsPDF
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                const canvasAspect = canvas.width / canvas.height;
                const imgWidth = pdfWidth;
                const imgHeight = pdfWidth / canvasAspect;

                let heightLeft = imgHeight;
                let position = 0;

                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pdfHeight;

                while (heightLeft >= 0) {
                    position = heightLeft - imgHeight;
                    pdf.addPage();
                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pdfHeight;
                }

                pdf.save(`${(seriesTitle || 'Series').replace(/[^a-z0-9]/gi, '_')}.pdf`);
            } else {
                alert('Failed to fetch series data for PDF export.');
            }

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('An error occurred while generating the PDF.');
        } finally {
            setIsDownloading(false);
            if (hiddenContainerRef.current) {
                hiddenContainerRef.current.innerHTML = '';
            }
        }
    };

    return (
        <>
            <button
                onClick={handleDownload}
                disabled={isDownloading}
                style={{
                    background: isDownloading ? 'rgba(49,130,206,0.5)' : 'linear-gradient(135deg, #00d4ff, #4a90d9)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '8px 16px',
                    fontWeight: 'bold',
                    cursor: isDownloading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 10px rgba(0, 212, 255, 0.3)',
                    transition: 'all 0.3s ease',
                    marginTop: '10px'
                }}
            >
                {isDownloading ? 'Generating PDF...' : '📄 Download Series as PDF'}
            </button>

            {/* Hidden container for rendering HTML to Canvas */}
            <div
                ref={hiddenContainerRef}
                style={{
                    position: 'absolute',
                    top: '-9999px',
                    left: '-9999px',
                    width: '800px',
                    background: '#fff',
                    zIndex: -1
                }}
            />
        </>
    );
};

export default DownloadSeriesPDF;
