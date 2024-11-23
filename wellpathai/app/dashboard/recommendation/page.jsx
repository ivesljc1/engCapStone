import { useState, useEffect } from 'react';

//frontend for recommendations page!
export default function RecommendationsPage() {
    const [recommendations, setRecommendations] = useState([]);
  
    useEffect(() => {
      fetch('/api/recommend-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ report: 'example report data' }),
      })
        .then((response) => response.json())
        .then((data) => setRecommendations(data));
    }, []);
  
    return (
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Recommended Health Tests</h1>
        <ul>
          {recommendations.map((test, index) => (
            <li key={index}>{test}</li>
          ))}
        </ul>
      </div>
    );
  }