import _ from 'react';
import { Notification } from './useNotification';

export function NotificationToast(props: { notifications: Notification[], unregisterNotification: (id: string) => void }) {
  return (
    <div className="toast-container position-fixed top-0 end-0 p-3" >
      {

        props.notifications.map((n, index) => (
          IndividualToast({
            n: n,
            index: index,
            onClose: () => {
              props.unregisterNotification(n.id);
            }
          }
          )))
      }
    </div >
  )
}

function IndividualToast(props: { n: Notification, index: number, onClose: () => void }) {
  const n = props.n;

  const headerColorClass = n.severity === 'success' ? 'text-bg-success text-white'
    : n.severity === 'warning' ? 'text-bg-warning text-white'
      : 'text-bg-danger text-white';

  const bodyColorClass = n.severity === 'success' ? 'bg-success-subtle'
    : n.severity === 'warning' ? 'bg-warning-subtle'
      : 'bg-danger-subtle';

  const title = n.severity === 'success' ? 'Success'
    : n.severity === 'warning' ? 'Warning'
      : 'Error';

  return (
    <div key={props.index} className="toast fade show" role="alert" aria-live="assertive" aria-atomic="true" >
      <div className={`toast-header ${headerColorClass}`} >
        <strong className="me-auto" > {title} </strong>
        < button type="button" onClick={() => props.onClose()} className="btn-close" data-bs-dismiss="toast" aria-label="Close" > </button>
      </div>
      < div className={`toast-body ${bodyColorClass}`} >
        {n.message}
      </div>
    </div >
  )
}
