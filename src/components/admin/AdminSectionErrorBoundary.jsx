import { Component } from 'react';

export default class AdminSectionErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    const sectionTitle = this.props.sectionTitle || 'Admin helper section';
    console.error(`[Admin] ${sectionTitle} failed to render.`, error, info);
  }

  render() {
    if (this.state.hasError) {
      const { sectionTitle } = this.props;
      return (
        <section className="admin-helper-card admin-helper-card-fallback" role="status" aria-live="polite">
          <h2>{sectionTitle || 'Admin helper unavailable'}</h2>
          <p>This admin helper failed to render.</p>
          <p>The rest of the admin page is still available.</p>
        </section>
      );
    }

    return this.props.children;
  }
}
