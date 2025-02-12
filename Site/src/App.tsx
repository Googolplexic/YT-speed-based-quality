import './App.css'
import { Helmet } from 'react-helmet'
import { Analytics } from "@vercel/analytics/react"
import favicon from './assets/favicon.ico'

function App() {
  return (
    <div className="landing">
      <Helmet>
        <title>YouTube Speed Optimizer - Auto Quality Control for Speed Watching</title>
        <meta name="description" content="Save data while speed watching YouTube videos. Automatically adjusts video quality based on playback speed." />
        <link rel="icon" type="image/x-icon" href={favicon} />
      </Helmet>

      <header>
        <div className="logo">YouTube Speed Optimizer</div>
        <nav>
          <a href="#features">Features</a>
          <a href="#presets">Presets</a>
          <a href="#install">Install</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Save Data While Speed Watching</h1>
          <p>Lower video quality automatically when watching at higher speeds on YouTube.</p>
          <div className="cta-group">
            <a href="#install" className="cta-button">Available on Chrome Web Store</a>
          </div>
        </section>

        <section id="features" className="features">
          <h2>Features</h2>
          <div className="feature-grid">
            <div className="feature-card">
              <h3>Auto Quality</h3>
              <p>Reduces resolution at higher speeds to save data.</p>
            </div>
            <div className="feature-card">
              <h3>Speed Detection</h3>
              <p>Changes quality when you adjust playback speed.</p>
            </div>
            <div className="feature-card">
              <h3>Presets</h3>
              <p>Choose from presets or create custom settings.</p>
            </div>
          </div>
        </section>

        <section id="presets" className="presets">
          <h2>Presets</h2>
          <div className="preset-cards">
            <div className="preset-card">
              <h3>Efficient</h3>
              <p>Most used</p>
              <ul>
                <li>1.5x speed trigger</li>
                <li>480p for fast viewing</li>
                <li>1080p normal speed</li>
              </ul>
            </div>
            <div className="preset-card">
              <h3>Ultra Light</h3>
              <p>Maximum data savings</p>
              <ul>
                <li>1.25x speed threshold</li>
                <li>360p above threshold</li>
                <li>720p below threshold</li>
              </ul>
            </div>
            <div className="preset-card">
              <h3>Balanced</h3>
              <p>Quality-focused savings</p>
              <ul>
                <li>1.75x speed threshold</li>
                <li>720p above threshold</li>
                <li>1080p below threshold</li>
              </ul>
            </div>
            <div className="preset-card">
              <h3>High Quality</h3>
              <p>Premium viewing experience</p>
              <ul>
                <li>2.0x speed threshold</li>
                <li>1080p above threshold</li>
                <li>1440p below threshold</li>
              </ul>
            </div>
          </div>
        </section>

        <section id="install" className="install">
          <h2>Install</h2>
          <div className="install-steps">
            <div className="step">
              <span className="step-number">1</span>
              <h3>Add to Chrome</h3>
              <p>Visit the Chrome Web Store page</p>
            </div>
            <div className="step">
              <span className="step-number">2</span>
              <h3>Install</h3>
              <p>Click "Add to Chrome"</p>
            </div>
          </div>
          <div className="install-note">
            <p>Coming soon to Chrome Web Store</p>
          </div>
        </section>
      </main>

      <footer>
        <p>Created by <a href="https://www.colemanlai.com">Coleman Lai</a></p>
      </footer>
      <Analytics />
    </div>
  )
}

export default App
