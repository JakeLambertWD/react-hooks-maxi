import React, { useState, useEffect, useRef } from 'react';

import Card from '../UI/Card';
import './Search.css';

const Search = React.memo(props => {
	const [enteredFilter, setEnteredFilter] = useState('');
	const { onLoadIngredients } = props;
	const inputRef = useRef();

	// update on each key stroke
	useEffect(() => {
		// wait for user to pause typing (saves spamming server w/ requests)
		const timer = setTimeout(() => {
			// compare old state to current value
			if (enteredFilter === inputRef.current.value) {
				// setup query string
				const query = enteredFilter.length === 0 ? '' : `?orderBy="title"&equalTo="${enteredFilter}"`;
				// fetch from firebase
				fetch('https://react-hooks-e535f-default-rtdb.firebaseio.com/ingredients.json' + query)
					.then(response => response.json())
					.then(responseData => {
						const loadedIngredients = [];
						for (const key in responseData) {
							loadedIngredients.push({
								id: key,
								title: responseData[key].title,
								amount: responseData[key].amount
							});
						}

						onLoadIngredients(loadedIngredients);
					});
			}
		}, 500);

		// clears the previous Timeout to avoid redundancies in memory
		return () => {
			clearTimeout(timer);
		};
	}, [enteredFilter, onLoadIngredients, inputRef]);

	return (
		<section className='search'>
			<Card>
				<div className='search-input'>
					<label>Filter by Title</label>
					<input type='text' ref={inputRef} value={enteredFilter} onChange={event => setEnteredFilter(event.target.value)} />
				</div>
			</Card>
		</section>
	);
});

export default Search;
