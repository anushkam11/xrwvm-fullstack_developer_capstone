import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../api';

export default function PostReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api('dealer/' + id), api('get_cars')])
      .then(([details, cars]) => setData({ dealer: details.dealer[0], cars: cars.CarModels }))
      .catch(failure => setError(failure.message));
  }, [id]);

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fields = Object.fromEntries(new FormData(event.currentTarget));
      await api('add_review', { ...fields, dealership: id });
      navigate('/dealer/' + id);
    } catch (failure) {
      setError(failure.message);
      setSaving(false);
    }
  }

  if (!data) return <p>{error || 'Loading review form…'}</p>;
  if (!data.dealer) return <p>Dealership not found.</p>;
  return <form onSubmit={submit} className="panel form">
    <h1>Post Review</h1>
    <p>{data.dealer.full_name}</p>
    <label>Review<textarea name="review" rows="5" maxLength={2000} required /></label>
    <label>Purchase Date<input type="date" name="purchase_date" required /></label>
    <label>Car Make and Model<select name="car_id" defaultValue="" required>
      <option value="" disabled>Choose a car</option>
      {data.cars.map(car => <option key={car.id} value={car.id}>{car.CarMake} {car.CarModel} ({car.CarYear})</option>)}
    </select></label>
    <label>Car Year<input type="number" name="car_year" min="2015" max="2023" required /></label>
    {error && <p role="alert">{error}</p>}
    <button type="submit" disabled={saving}>{saving ? 'Posting…' : 'Post Review'}</button>
  </form>;
}
