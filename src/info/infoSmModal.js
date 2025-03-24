import React from "react";
import { useTranslation } from 'react-i18next';

const InfoSmModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div style={infoModalStyle}>
            <div style={infoModalContentStyle}>
                <div className="modal-header">
                    <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '1.5rem' }}>
                        {t("Resource Mapping")}
                    </h2>
                </div>

                <div style={contentSectionStyle}>
                    <p style={paragraphStyle}>{t("info_social_1")}</p>
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


export default InfoSmModal;


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
    width: '300px',
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

const paragraphStyle = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#4B5563',
    margin: '0 0 12px 0',
};

const closeButtonContainerStyle = {
    textAlign: 'center',
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
