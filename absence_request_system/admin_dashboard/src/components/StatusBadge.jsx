export function StatusBadge({ status }) {
    const getStatusStyle = () => {
        switch (status.toLowerCase()) {
            case 'pending':
                return {
                    backgroundColor: '#ff9800',
                    color: 'white',
                    text: 'قيد الانتظار',
                }
            case 'approved':
                return {
                    backgroundColor: '#4caf50',
                    color: 'white',
                    text: 'موافق عليه',
                }
            case 'rejected':
                return {
                    backgroundColor: '#f44336',
                    color: 'white',
                    text: 'مرفوض',
                }
            default:
                return {
                    backgroundColor: '#9e9e9e',
                    color: 'white',
                    text: status,
                }
        }
    }

    const style = getStatusStyle()

    return (
        <span
            style={{
                display: 'inline-block',
                padding: '6px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 'bold',
                backgroundColor: style.backgroundColor,
                color: style.color,
            }}
        >
            {style.text}
        </span>
    )
}
