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

const ALB_DNS = "http://url-shortenining-alb-565984806.us-east-1.elb.amazonaws.com";

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
          {loading ? "Shortening..." : "Shorten"}
        </button>
        {shortUrl && (
          <p className="mt-3 text-center">
            Shortened URL: <a href={`${ALB_DNS}/${shortUrl}`} target="_blank" rel="noopener noreferrer">{shortUrl}</a>
          </p>
        )}
        <button className="btn btn-secondary w-100 mt-2" onClick={() => navigate("/fetch-url")}>
          Fetch Long URL
        </button>
      </div>
    </div>
  );
};

// Fetch Long URL Page with Delete Functionality
const FetchLongUrl = () => {
  const [shortKey, setShortKey] = useState("");
  const [longUrl, setLongUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Extract short key from URL if it's a full URL
    if (shortKey.startsWith(ALB_DNS)) {
      const extractedKey = shortKey.replace(`${ALB_DNS}/`, "");
      setShortKey(extractedKey);
    }
  }, [shortKey]);

  const handleFetch = async () => {
      setLoading(true);
      setMessage("");

      // Extract short key if a full URL is provided
      const extractedKey = shortKey.replace(/^https?:\/\/[^/]+\//, ""); // Removes base URL
      setShortKey(extractedKey);

      try {
        const response = await axios.get(`${ALB_DNS}/fetch_url/${extractedKey}`);
        setLongUrl(response.data.long_url);
      } catch (error) {
        console.error("Invalid short URL", error);
        setLongUrl("Not found");
      }
      setLoading(false);
  };

  const handleDelete = async () => {
      if (!shortKey) return;

      // Extract short key if a full URL is provided
      const extractedKey = shortKey.replace(/^https?:\/\/[^/]+\//, ""); 
      setShortKey(extractedKey);

      try {
        await axios.delete(`${ALB_DNS}/delete_url/${extractedKey}`);
        setMessage("Short URL deleted successfully.");
        setLongUrl("");
        setShortKey("");
      } catch (error) {
        setMessage("Failed to delete URL.");
        console.error("Error deleting URL", error);
      }
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
            onChange={(e) => setShortKey(e.target.value.trim())}
          />
        </div>
        <button className="btn btn-success w-100" onClick={handleFetch} disabled={loading}>
          {loading ? "Fetching..." : "Fetch"}
        </button>
        {longUrl && (
          <div className="mt-3 text-center">
            <p>Original URL: <a href={longUrl} target="_blank" rel="noopener noreferrer">{longUrl}</a></p>
          </div>
        )}
        <button className="btn btn-danger w-100 mt-2" onClick={handleDelete}>Delete Short URL</button>
        {message && <p className="text-center mt-3 text-danger">{message}</p>}
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