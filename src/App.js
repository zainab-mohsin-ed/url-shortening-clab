import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

const ALB_DNS = "<ALB_DNS>";

// Home Page - URL Shortener
const Home = () => {
  const [originalUrl, setOriginalUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleShorten = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${ALB_DNS}/shorten_url`, {
        long_url: originalUrl,
      });
      setShortUrl(response.data.shortUrl || response.data.short_url);
    } catch (error) {
      console.error("Error shortening URL", error);
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-3">URL Shortener</h2>
        <div className="mb-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter URL"
            value={originalUrl}
            onChange={(e) => setOriginalUrl(e.target.value)}
          />
        </div>
        <button className="btn btn-primary w-100" onClick={handleShorten} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>{" "}
              Shortening...
            </>
          ) : (
            "Shorten"
          )}
        </button>
        {shortUrl && (
          <p className="mt-3 text-center">
            Shortened URL:{" "}
            <a href={`${ALB_DNS}/${shortUrl}`} target="_blank" rel="noopener noreferrer">
              {shortUrl}
            </a>
          </p>
        )}
        <button className="btn btn-secondary w-100 mt-2" onClick={() => navigate("/fetch-url")}>
          Fetch Long URL
        </button>
      </div>
    </div>
  );
};

// Fetch Long URL Page
const FetchLongUrl = () => {
  const [shortKey, setShortKey] = useState("");
  const [longUrl, setLongUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${ALB_DNS}/fetch_url/${shortKey}`);
      setLongUrl(response.data.long_url);
    } catch (error) {
      console.error("Invalid short URL", error);
      setLongUrl("Not found");
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-3">Fetch Long URL</h2>
        <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Enter short URL or short key"
          value={shortKey}
          onChange={(e) => {
            const inputValue = e.target.value.trim();
            try {
              // Extract short key from full URL
              const url = new URL(inputValue);
              const extractedKey = url.pathname.replace("/", ""); // Remove leading "/"
              setShortKey(extractedKey);
            } catch (error) {
              // If it's not a full URL, assume it's already a short key
              setShortKey(inputValue);
            }
          }}
        />
        </div>
        <button className="btn btn-success w-100" onClick={handleFetch} disabled={loading}>
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>{" "}
              Fetching...
            </>
          ) : (
            "Fetch"
          )}
        </button>
        {longUrl && (
          <p className="mt-3 text-center">
            Original URL:{" "}
            <a href={longUrl} target="_blank" rel="noopener noreferrer">
              {longUrl}
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

// Redirect Page
const Redirect = () => {
  const { shortKey } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOriginalUrl = async () => {
      try {
        const response = await axios.get(`${ALB_DNS}/fetch_url/${shortKey}`);
        window.location.href = response.data.long_url;
      } catch (error) {
        console.error("Invalid short URL", error);
        navigate("/");
      }
    };
    fetchOriginalUrl();
  }, [shortKey, navigate]);

  return (
    <div className="container mt-5 text-center">
      <h2>Redirecting...</h2>
    </div>
  );
};

// Main App Component
const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fetch-url" element={<FetchLongUrl />} />
        <Route path=":shortKey" element={<Redirect />} />
      </Routes>
    </Router>
  );
};

export default App;
