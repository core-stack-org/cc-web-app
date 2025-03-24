import React from "react";
import { useTranslation } from 'react-i18next';

const InfoWaterModal = ({ isOpen, onClose, currentLegend }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const renderMWSLegend = () => (
        <div style={sectionStyle}>
            <h3 style={sectionHeadingStyle}>Well Depth Legend</h3>
            <div style={{ ...legendStyle, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                    <div style={{ ...colorPill, backgroundColor: '#ff0000' }}></div>
                    <span style={legendTextStyle}>Less than -5m</span>
                </div>
                <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                    <div style={{ ...colorPill, backgroundColor: '#ffff00' }}></div>
                    <span style={legendTextStyle}>-5m to -1m</span>
                </div>
                <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                    <div style={{ ...colorPill, backgroundColor: '#25B63C' }}></div>
                    <span style={legendTextStyle}>-1m to 1m</span>
                </div>
                <div style={{ ...legendItemStyle }}>
                    <div style={{ ...colorPill, backgroundColor: '#1017F8' }}></div>
                    <span style={legendTextStyle}>More than 1m</span>
                </div>
            </div>
        </div>
    );

    const renderClartLegend = () => (
        <div style={sectionStyle}>
            <h3 style={sectionHeadingStyle}>CLART Legend</h3>
            <div style={legendGridStyle}>
                <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                    <div style={{ ...colorPill, backgroundColor: '#F5F6FE' }}></div>
                    <span style={legendTextStyle}>Empty</span>
                </div>
                <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                    <div style={{ ...colorPill, backgroundColor: '#4EE323' }}></div>
                    <span style={legendTextStyle}>Good recharge</span>
                </div>
                <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                    <div style={{ ...colorPill, backgroundColor: '#F3FF33' }}></div>
                    <span style={legendTextStyle}>Moderate recharge</span>
                </div>
                <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                    <div style={{ ...colorPill, backgroundColor: '#B40F7D' }}></div>
                    <span style={legendTextStyle}>Regeneration</span>
                </div>
                <div style={{ ...legendItemStyle }}>
                    <div style={{ ...colorPill, backgroundColor: '#1774DE' }}></div>
                    <span style={legendTextStyle}>High runoff zone</span>
                </div>
                <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                    <div style={{ ...colorPill, backgroundColor: '#F21223' }}></div>
                    <span style={legendTextStyle}>Surface water harvesting</span>
                </div>
            </div>
        </div>
    );

    return (
        <div style={infoModalStyle}>
            <div style={infoModalContentStyle}>
                <div className="modal-header">
                    <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '1.5rem' }}>
                        {t("GroundWater")}
                    </h2>
                </div>

                <div style={contentSectionStyle}>
                    <p style={paragraphStyle}>{t("info_gw_1")}</p>

                    <div style={sectionStyle}>
                        <h3 style={sectionHeadingStyle}>{t("Analyze")}</h3>
                        <p style={paragraphStyle}>{t("info_gw_2")}</p>
                    </div>

                    <div style={sectionStyle}>
                        <h3 style={sectionHeadingStyle}>{t("Start Planning")}</h3>
                        <p style={paragraphStyle}>{t("info_gw_3")}</p>
                    </div>

                    <div style={noteStyle}>
                        <p style={{ ...paragraphStyle, fontStyle: 'italic', margin: 0 }}>Note: Well depth tab need to selected</p>
                    </div>

                    {currentLegend === "MWS" ? renderMWSLegend() : null}
                    {currentLegend === "CLART" ? renderClartLegend() : null}
                </div>

                <div style={closeButtonContainerStyle}>
                    <button
                        onClick={onClose}
                        style={closeButtonStyle}
                        onMouseOver={(e) => {
                            e.target.style.backgroundColor = '#f3f4f6';
                            e.target.style.borderColor = '#1F2937';
                        }}
                        onMouseOut={(e) => {
                            e.target.style.backgroundColor = 'white';
                            e.target.style.borderColor = '#374151';
                        }}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


export default InfoWaterModal;


const infoModalStyle = {
    position: 'fixed',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000',
    animation: 'fadeIn 0.3s ease-out',
};

const infoModalContentStyle = {
    width: '450px',
    maxWidth: '80%',
    maxHeight: '85vh',
    padding: '24px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    textAlign: 'left',
    overflow: 'auto',
    position: 'relative',
};

const contentSectionStyle = {
    animation: 'fadeIn 0.3s ease-out',
    marginBottom: '20px',
};

const sectionStyle = {
    marginBottom: '20px',
};

const sectionHeadingStyle = {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: '8px',
};

const paragraphStyle = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#4B5563',
    margin: '0 0 12px 0',
};

const noteStyle = {
    backgroundColor: '#F3F4F6',
    borderLeft: '4px solid #2563EB',
    padding: '12px 16px',
    marginBottom: '20px',
    borderRadius: '0 4px 4px 0',
};

const closeButtonContainerStyle = {
    textAlign: 'right',
    marginTop: '16px',
};

const closeButtonStyle = {
    backgroundColor: 'white',
    border: '1px solid #374151',
    borderRadius: '6px',
    color: '#111827',
    padding: '8px 16px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
};


const legendGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px 20px',
    alignItems: 'center',
    maxWidth: '100%',
    marginTop: '16px',
};

const legendStyle = {
    padding: '10px 0',
};

const legendItemStyle = {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap',
    maxWidth: '200px',
};

const legendTextStyle = {
    fontSize: '14px',
    color: '#4B5563',
};

const colorPill = {
    width: '14px',
    height: '24px',
    borderRadius: '7px',
    marginRight: '8px',
};