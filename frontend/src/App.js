import { useState, useEffect } from 'react';


function App() {
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photo, setPhoto] = useState(null);
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');

  const handleGetLocation = () => {
    setLocationError('');
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude);
        setLng(position.coords.longitude);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationError('Could not get location automatically. Please enter it manually.');
      },
      {
        enableHighAccuracy: false,
        timeout: 20000,
        maximumAge: 60000
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim() || !name.trim() || !phone.trim()) {
      setMessage('Please fill description, name, and phone.');
      return;
    }
    if (phone.trim().length < 8) {
      setMessage('Please enter a valid phone number.');
      return;
    }


    setMessage('');
    setLoading(true);

    try {
      //console.log('Submitting with coords:', lat, lng, 'manual:', manualLat, manualLng);

      const formData = new FormData();
      formData.append('description', description);
      formData.append('reporter_name', name);
      formData.append('reporter_phone', phone);

      // prefer GPS, fall back to manual if provided
      const finalLat = lat != null ? lat : manualLat || null;
      const finalLng = lng != null ? lng : manualLng || null;

      if (finalLat != null) formData.append('latitude', finalLat);
      if (finalLng != null) formData.append('longitude', finalLng);

      if (photo) formData.append('photo', photo);

      const res = await fetch('http://localhost:5000/api/reports', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('Created report:', data);

      setMessage('Report submitted. Rescue team notified.');
      setDescription('');
      setName('');
      setPhone('');
      setPhoto(null);
      // keep lat/lng so user sees what was sent
    } catch (err) {
      console.error('Error submitting report:', err);
      setMessage('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '700px' }}>
      <center><h1>INJURED ANIMAL REPORT</h1></center>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Description:</label><br />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{ width: '100%' }}
            placeholder="Describe the injury and animal."
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Your name:</label><br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Phone number:</label><br />
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Upload photo of animal (optional):</label><br />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhoto(e.target.files[0] || null)}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label>Location:</label><br />
          <button
            type="button"
            onClick={handleGetLocation}
            style={{ marginBottom: '5px' }}
          >
            Use my current location
          </button>

          {lat != null && lng != null && (
            <div>
              <small>Captured: {lat.toFixed(5)}, {lng.toFixed(5)}</small>
            </div>
          )}

          {locationError && (
            <div style={{ color: 'red', marginTop: '4px' }}>
              <small>{locationError}</small>
            </div>
          )}

          <div style={{ marginTop: '6px' }}>
            <small>If automatic location fails, enter coordinates manually:</small><br />
            <input
              type="text"
              placeholder="Latitude, e.g. 29.43055"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              style={{ width: '48%', marginRight: '4%' }}
            />
            <input
              type="text"
              placeholder="Longitude, e.g. 74.92088"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              style={{ width: '48%' }}
            />
          </div>
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit report'}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: '15px' }}>{message}</p>
      )}

      <hr style={{ margin: '20px 0' }} />
      <h2>Recent NGO reports:</h2>
      <ReportsList />

    </div>
  );
}

function ReportsList() {
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('http://localhost:5000/api/reports?onlyOpen=true')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setReports(Array.isArray(data) ? data : []);
        setError('');
      })
      .catch((err) => {
        console.error('Error loading reports:', err);
        setError('Failed to load reports.');
      })
      .finally(() => setLoadingReports(false));
  }, []);

  if (loadingReports) return <p>Loading reports...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  if (reports.length === 0) return <p>No reports yet.</p>;

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/reports/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      // Update local state so UI refreshes without full reload
      setReports((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: newStatus } : r
        )
      );
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  return (
    <table border="1" cellPadding="6" style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Time</th>
          <th>Description</th>
          <th>Reporter</th>
          <th>Phone</th>
          <th>Photo</th>
          <th>Location</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {reports.map((r) => (
          <tr key={r.id}>
            <td>{r.id}</td>
            <td>{new Date(r.created_at).toLocaleString()}</td>
            <td>{r.description}</td>
            <td>{r.reporter_name}</td>
            <td>{r.reporter_phone}</td>
            <td>
              {r.image_path ? (
                <a href={`http://localhost:5000${r.image_path}`} target="_blank" rel="noreferrer">
                  View photo
                </a>
              ) : (
                'No photo'
              )}
            </td>
            <td>
              {r.latitude && r.longitude ? (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${r.latitude},${r.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Maps
                </a>
              ) : (
                'No location'
              )}
            </td>
            <td>{r.status}</td>
            <td>
              {r.status === 'PENDING' && (
                <>
                  <button onClick={() => updateStatus(r.id, 'ON_THE_WAY')}>
                    Mark on the way
                  </button>
                  <button
                    onClick={() => updateStatus(r.id, 'RESOLVED')}
                    style={{ marginLeft: '4px' }}
                  >
                    Mark resolved
                  </button>
                </>
              )}

              {r.status === 'ON_THE_WAY' && (
                <button onClick={() => updateStatus(r.id, 'RESOLVED')}>
                  Mark resolved
                </button>
              )}

              {r.status === 'RESOLVED' && <span>Completed</span>}
            </td>

          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default App;
