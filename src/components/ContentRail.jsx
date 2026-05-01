export default function ContentRail({ title, description, emptyMessage, viewAllHref, className = '', children }) {
  const childCount = Array.isArray(children) ? children.filter(Boolean).length : children ? 1 : 0;

  return (
    <section className={`rail ${className}`.trim()}>
      <div className="rail-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        {viewAllHref ? <a href={viewAllHref}>View all</a> : null}
      </div>
      {childCount === 0 ? (
        <div className="empty-rail"><p>{emptyMessage || 'Nothing here yet.'}</p></div>
      ) : children}
    </section>
  );
}
