import React from "react";
import { IconWarn, IconInfo, IconTrash } from "./ui/icons";

/**
 * window.confirm / window.alert 대체용 레이어 팝업.
 *
 *   const confirm = useConfirm();
 *   if (!(await confirm({ title, message, confirmText, tone: "danger" }))) return;
 *   await confirm({ title, message, alert: true });   // 확인 버튼만 (alert)
 *
 * App 최상단에서 <ConfirmProvider> 로 감싼다.
 */
const ConfirmContext = React.createContext(null);

export function useConfirm() {
    const ctx = React.useContext(ConfirmContext);
    if (!ctx) throw new Error("useConfirm 은 <ConfirmProvider> 안에서만 쓸 수 있습니다");
    return ctx;
}

export function ConfirmProvider({ children }) {
    const [dialog, setDialog] = React.useState(null);   // { ...options, resolve }
    const current = React.useRef(null);
    const queue = React.useRef([]);

    /* setState 업데이터 안에서 부수효과를 내지 않도록 ref 로 현재 팝업을 관리 */
    const show = React.useCallback((item) => {
        current.current = item;
        setDialog(item);
    }, []);

    const confirm = React.useCallback((options) => new Promise((resolve) => {
        const item = { ...(typeof options === "string" ? { message: options } : options), resolve };
        if (current.current) queue.current.push(item);
        else show(item);
    }), [show]);

    const close = React.useCallback((result) => {
        const item = current.current;
        if (!item) return;
        item.resolve(result);
        show(queue.current.shift() || null);
    }, [show]);

    return (
        <ConfirmContext.Provider value={confirm}>
            {children}
            {dialog && <DialogLayer dialog={dialog} onClose={close} />}
        </ConfirmContext.Provider>
    );
}

const TONE_ICON = { danger: IconTrash, warn: IconWarn, info: IconInfo };

function DialogLayer({ dialog, onClose }) {
    const {
        title = dialog.alert ? "알림" : "확인",
        message,
        detail,
        confirmText = "확인",
        cancelText = "취소",
        tone = dialog.alert ? "info" : "warn",
        alert = false,
    } = dialog;

    const okRef = React.useRef(null);
    const cancelRef = React.useRef(null);
    const Icon = TONE_ICON[tone] || IconWarn;

    React.useEffect(() => {
        const previous = document.activeElement;
        // 파괴적 동작은 취소에, 그 외에는 확인에 포커스
        (tone === "danger" && !alert ? cancelRef.current : okRef.current)?.focus();

        const onKey = (e) => {
            if (e.key === "Escape") { e.preventDefault(); onClose(alert ? true : false); }
        };
        window.addEventListener("keydown", onKey);
        return () => {
            window.removeEventListener("keydown", onKey);
            if (previous && typeof previous.focus === "function") previous.focus({ preventScroll: true });
        };
    }, [dialog, alert, tone, onClose]);

    return (
        <div className="modal-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(alert ? true : false); }}>
            <div
                className={`modal modal-${tone}`}
                role={alert ? "alertdialog" : "dialog"}
                aria-modal="true"
                aria-labelledby="modal-title"
                aria-describedby="modal-message"
            >
                <div className="modal-head">
                    <span className="modal-ico"><Icon size={15} /></span>
                    <h3 id="modal-title" className="modal-title">{title}</h3>
                </div>
                <div id="modal-message" className="modal-body">
                    {message}
                    {detail && <div className="modal-detail">{detail}</div>}
                </div>
                <div className="modal-foot">
                    {!alert && (
                        <button ref={cancelRef} type="button" className="btn" onClick={() => onClose(false)}>
                            {cancelText}
                        </button>
                    )}
                    <button
                        ref={okRef}
                        type="button"
                        className={`btn ${tone === "danger" ? "btn-danger-solid" : "btn-primary"}`}
                        onClick={() => onClose(true)}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
