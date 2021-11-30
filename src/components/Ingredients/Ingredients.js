import React, { useReducer, useCallback } from 'react';

import IngredientList from './IngredientList';
import IngredientForm from './IngredientForm';
import Search from './Search';
import ErrorModal from '../UI/ErrorModal';

const ingredientReducer = (currentIngredients, action) => {
	switch (action.type) {
		case 'SET':
			return action.ingredients;
		case 'ADD':
			return [...currentIngredients, action.ingredient];
		case 'DELETE':
			return currentIngredients.filter(ing => ing.id !== action.id);
		default:
			throw new Error('Should you get there!');
	}
};

const httpReducer = (httpState, action) => {
	switch (action.type) {
		case 'SEND':
			return { loading: true, error: null };
		case 'RESPONSE':
			return { ...httpState, loading: false };
		case 'ERROR':
			return { loading: false, error: action.errorData };
		case 'CLEAR':
			return { ...httpState, error: null };
		default:
			throw new Error('Error!');
	}
};

function Ingredients() {
	// Reducer - ingredients
	const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
	// Reducer - http requests
	const [httpState, dispatchHttp] = useReducer(httpReducer, { loading: false, error: null });

	// SEARCH
	// wrap with useCallback to prevent unnecessary renders
	const filteredIngredientsHandler = useCallback(filteredIngredients => {
		// setUserIngredients(filteredIngredients);
		dispatch({ type: 'SET', ingredients: filteredIngredients });
	}, []); // created ONLY ONCE (after first render)

	// SAVE
	const addIngredientHandler = ingredient => {
		dispatchHttp({ type: 'SEND' });
		fetch('https://react-hooks-e535f-default-rtdb.firebaseio.com/ingredients.json', {
			method: 'POST',
			// converts a JS value to a JSON string
			body: JSON.stringify(ingredient),
			headers: { 'Content-Type': 'application/json' }
		})
			.then(response => {
				dispatchHttp({ type: 'RESPONSE' });
				// extract the body and convert back to JS
				return response.json();
			})
			.then(responseData => {
				// setUserIngredients(prevState => {
				// 	// return array
				// 	// copy of previous state
				// 	// set id
				// 	// spread into individual components of the object
				// 	return [...prevState, { id: responseData.name, ...ingredient }];
				// });
				dispatch({ type: 'ADD', ingredient: { id: responseData.name, ...ingredient } });
			})
			.catch(err => {
				dispatchHttp({ type: 'ERROR', errorData: err.message });
			});
	};

	// REMOVE
	const removeIngredientHandler = ingredientId => {
		dispatchHttp({ type: 'SEND' });
		fetch(`https://react-hooks-e535f-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`, {
			method: 'DELETE'
		})
			.then(response => {
				dispatchHttp({ type: 'RESPONSE' });
				// filter() creates a complete new array
				// setUserIngredients(prevState => prevState.filter(ingredient => ingredient.id !== ingredientId));
				dispatch({ type: 'DELETE', id: ingredientId });
			})
			.catch(err => {
				dispatchHttp({ type: 'ERROR', errorData: err.message });
			});
	};

	// ERROR
	const errorCloseHander = () => {
		dispatchHttp({ type: 'CLEAR' });
	};

	return (
		<div className='App'>
			{httpState.error && <ErrorModal onClose={errorCloseHander}>{httpState.error}</ErrorModal>}
			{/* point to function */}
			<IngredientForm onAddIngredientHandler={addIngredientHandler} loading={httpState.loading} />

			<section>
				<Search onLoadIngredients={filteredIngredientsHandler} />
				<IngredientList ingredients={userIngredients} onRemoveItem={removeIngredientHandler} />
			</section>
		</div>
	);
}

export default Ingredients;
