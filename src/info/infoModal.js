import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import "./infoModal.css"
import usePlansStore from "../hooks/usePlans.js";

const InfoModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [planMetaData, setPlanMetaData] = useState(null);
    const [activeTab, setActiveTab] = useState(1);
    const { currentPlan } = usePlansStore((state) => {
        return {
            currentPlan: state.currentPlan
        };
    });

    useEffect(() => {
        if (currentPlan !== null) {
            let tempStore = []
            Object.keys(currentPlan).forEach(key => {
                tempStore.push(
                    <div className="plan_metadata_item" key={key}>
                        <div className="plan_metadata_key">{`${key.toUpperCase()}`}</div>
                        <div className="plan_metadata_data">{currentPlan[key]}</div>
                    </div>
                )
            })
            setPlanMetaData(tempStore)
        }
    }, [currentPlan])

    if (!isOpen) return null;

    const handleTabChange = (tabNumber) => {
        setActiveTab(tabNumber);
    };

    return (
        <div style={infoModalStyle}>
            <div style={infoModalContentStyle}>
                <div className="modal-header">
                    <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '1.5rem' }}>
                        {activeTab === 1 ? t("Information") : "Plan Information"}
                    </h2>
                </div>

                <div style={tabContainerStyle}>
                    <button
                        style={{
                            ...tabStyle,
                            ...(activeTab === 1 ? activeTabStyle : {})
                        }}
                        onClick={() => handleTabChange(1)}
                    >
                        {t("Information")}
                    </button>
                    <button
                        style={{
                            ...tabStyle,
                            ...(activeTab === 2 ? activeTabStyle : {})
                        }}
                        onClick={() => handleTabChange(2)}
                    >
                        Plan Information
                    </button>
                </div>

                <div style={tabContentStyle}>
                    {activeTab === 1 && (
                        <div style={contentSectionStyle}>
                            <div style={stepContainerStyle}>
                                <div style={stepNumberStyle}>1</div>
                                <p style={stepTextStyle}>{t("info_main_1")}</p>
                            </div>
                            <div style={stepContainerStyle}>
                                <div style={stepNumberStyle}>2</div>
                                <p style={stepTextStyle}>{t("info_main_2")}</p>
                            </div>
                            <div style={stepContainerStyle}>
                                <div style={stepNumberStyle}>3</div>
                                <p style={stepTextStyle}>{t("info_main_3")}</p>
                            </div>

                            <div style={sectionStyle}>
                                <h3 style={sectionHeadingStyle}>{t("GroundWater")}</h3>
                                <p style={paragraphStyle}>{t("info_main_4")}</p>
                            </div>

                            <div style={sectionStyle}>
                                <h3 style={sectionHeadingStyle}>{t("Surface WaterBodies")}</h3>
                                <p style={paragraphStyle}>{t("info_main_5")}</p>
                            </div>

                            <div style={sectionStyle}>
                                <h3 style={sectionHeadingStyle}>{t("Agri")}</h3>
                                <p style={paragraphStyle}>{t("info_main_6")}</p>
                            </div>

                            <div style={sectionStyle}>
                                <h3 style={sectionHeadingStyle}>{t("Livelihood")}</h3>
                                <p style={paragraphStyle}>{t("info_main_7")}</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 2 && (
                        <div style={contentSectionStyle}>
                            {planMetaData !== null ? (
                                <div style={metadataContainerStyle}>
                                    {planMetaData}
                                </div>
                            ) : (
                                <div style={emptyStateStyle}>
                                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 8V12L15 15" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="12" cy="12" r="9" stroke="#9CA3AF" strokeWidth="2" />
                                    </svg>
                                    <h3 style={{ color: '#4B5563', marginTop: '16px' }}>Plan not Selected</h3>
                                    <p style={{ color: '#6B7280', marginTop: '8px' }}>Please select a plan to view its information</p>
                                </div>
                            )}
                        </div>
                    )}
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

export default InfoModal;

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

const tabContainerStyle = {
    display: 'flex',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '20px',
};

const tabStyle = {
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '500',
    color: '#6B7280',
    transition: 'all 0.2s ease',
    outline: 'none',
};

const activeTabStyle = {
    color: '#2563EB',
    borderBottom: '2px solid #2563EB',
    fontWeight: '600',
};

const tabContentStyle = {
    marginBottom: '20px',
    maxHeight: '60vh',
    overflow: 'auto',
    padding: '0 4px',
};

const contentSectionStyle = {
    animation: 'fadeIn 0.3s ease-out',
};

const stepContainerStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: '16px',
};

const stepNumberStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#2563EB',
    color: 'white',
    fontWeight: 'bold',
    marginRight: '12px',
    flexShrink: 0,
};

const stepTextStyle = {
    margin: '0',
    fontSize: '15px',
    lineHeight: '1.6',
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

const metadataContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '16px',
};

const emptyStateStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    textAlign: 'center',
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

const colorPill = {
    width: '14px',
    height: '24px',
    borderRadius: '7px',
    marginRight: '8px',
};
