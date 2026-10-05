import { AlertCircle, RefreshCw } from 'lucide-react';

export function PageSkeleton({ cards = 4, rows = 6 }) {
    return (
        <div className="page-container" aria-busy="true" aria-live="polite">
            <div className="skeleton-heading">
                <div>
                    <div className="skeleton skeleton-eyebrow" />
                    <div className="skeleton skeleton-title" />
                    <div className="skeleton skeleton-copy" />
                </div>
                <div className="skeleton skeleton-chip" />
            </div>

            {cards > 0 && (
                <div className="skeleton-card-grid">
                    {Array.from({ length: cards }, (_, index) => (
                        <div className="skeleton-card" key={index}>
                            <div className="skeleton skeleton-icon" />
                            <div className="skeleton skeleton-label" />
                            <div className="skeleton skeleton-value" />
                        </div>
                    ))}
                </div>
            )}

            <div className="skeleton-table">
                <div className="skeleton skeleton-table-header" />
                {Array.from({ length: rows }, (_, index) => (
                    <div className="skeleton skeleton-table-row" key={index} />
                ))}
            </div>
        </div>
    );
}

export function ErrorState({
    title = 'Unable to load data',
    message = "We couldn't retrieve the latest information from the AssetIQ API.",
    onRetry,
}) {
    return (
        <div className="state-page" role="alert">
            <div className="state-card state-card-error">
                <div className="state-icon">
                    <AlertCircle size={22} />
                </div>
                <div>
                    <h2>{title}</h2>
                    <p>{message}</p>
                </div>
                {onRetry && (
                    <button className="secondary-button" type="button" onClick={onRetry}>
                        <RefreshCw size={15} />
                        Retry
                    </button>
                )}
            </div>
        </div>
    );
}
