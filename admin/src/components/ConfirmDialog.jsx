export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null

  return (
    <div
      className="confirm-dialog-wrap"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      onClick={busy ? undefined : onCancel}
    >
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 id="confirm-dialog-title">{title}</h3>
        {message ? <p>{message}</p> : null}
        <div className="confirm-dialog-actions">
          <button
            type="button"
            className="btn-ghost"
            disabled={busy}
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={danger ? 'btn-danger' : 'btn-primary'}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
