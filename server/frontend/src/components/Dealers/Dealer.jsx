import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../../api';

export default function Dealer({ username }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api('dealer/' + id), api('reviews/dealer/' + id)])
      .then(([details, feedback]) => setData({ dealer: details.dealer[0], reviews: feedback.reviews }))
      .catch(failure => setError(failure.message));
  }, [id]);

  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p>Loading dealership…</p>;
  if (!data.dealer) return <p>Dealership not found.</p>;
  const { dealer, reviews } = data;

  return <>
    <div className="page-heading">
      <div><h1>{dealer.full_name}</h1>
        <p>{dealer.address}, {dealer.city}, {dealer.state} {dealer.zip}</p></div>
      {username && <Link className="button" to={'/postreview/' + id}>Post Review</Link>}
    </div>
    <h2>Customer reviews</h2>
    {!reviews.length && <p>No reviews yet.</p>}
    {reviews.map(review => <article className="panel review" key={review.id}>
      <div className="review-top"><strong>{review.name}</strong>
        <span className={'sentiment ' + review.sentiment}>{review.sentiment || 'neutral'}</span></div>
      <p>{review.review}</p><small>{review.car_year} {review.car_make} {review.car_model}</small>
    </article>)}
  </>;
}
