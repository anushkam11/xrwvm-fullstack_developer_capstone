import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api';

export default function Dealers({ username }) {
  const [params, setParams] = useSearchParams();
  const selected = params.get('state') || '';
  const [dealers, setDealers] = useState(null);
  const [states, setStates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('get_dealers').then(({ dealers }) =>
      setStates([...new Set(dealers.map(dealer => dealer.state))].sort()),
    ).catch(failure => setError(failure.message));
  }, []);

  useEffect(() => {
    let current = true;
    setDealers(null);
    setError('');
    const path = selected ? 'get_dealers/' + encodeURIComponent(selected) : 'get_dealers';
    api(path).then(result => {
      if (current) setDealers(result.dealers);
    }).catch(failure => {
      if (current) setError(failure.message);
    });
    return () => { current = false; };
  }, [selected]);

  return <>
    <div className="page-heading">
      <h1>Find a dealership</h1>
      <div><label htmlFor="dealer-state">State </label><select id="dealer-state" value={selected} onChange={event => setParams(event.target.value ? { state: event.target.value } : {})}>
        <option value="">All states</option>
        {states.map(state => <option key={state}>{state}</option>)}
      </select></div>
    </div>
    {error ? <p role="alert">{error}</p> : !dealers ? <p>Loading dealerships…</p> :
      dealers.length === 0 ? <p>No dealerships found.</p> :
      <div className="panel table-wrap"><table>
        <thead><tr><th>Dealer</th><th>City</th><th>Address</th><th>ZIP</th><th>State</th>
          {username && <th>Review Dealer</th>}</tr></thead>
        <tbody>{dealers.map(dealer => <tr key={dealer.id}>
          <td><Link to={'/dealer/' + dealer.id}>{dealer.full_name}</Link></td>
          <td>{dealer.city}</td><td>{dealer.address}</td><td>{dealer.zip}</td><td>{dealer.state}</td>
          {username && <td><Link to={'/postreview/' + dealer.id}>Review Dealer</Link></td>}
        </tr>)}</tbody>
      </table></div>}
  </>;
}
