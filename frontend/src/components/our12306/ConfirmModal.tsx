import React from 'react'
import './ConfirmModal.css'

type Props = { isVisible: boolean; title: string; message: string; confirmText: string; cancelText: string; onConfirm: () => void; onCancel: () => void }

const ConfirmModal: React.FC<Props> = ({ isVisible, title, message, confirmText, cancelText, onConfirm, onCancel }) => {
  if (!isVisible) return null
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header"><h3 className="modal-title">{title}</h3></div>
        <div className="modal-body"><p className="modal-message">{message}</p></div>
        <div className="modal-footer">
          <button className="modal-button confirm-button" onClick={onConfirm}>{confirmText}</button>
          <button className="modal-button cancel-button" onClick={onCancel}>{cancelText}</button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal