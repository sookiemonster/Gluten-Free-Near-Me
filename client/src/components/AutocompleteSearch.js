import React, { useState, useRef, useEffect } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

function AutocompleteSearch({onPlaceSelect}) {
   const [placeAutocomplete, setPlaceAutocomplete] = useState(null);
   const inputRef = useRef(null);
   const places = useMapsLibrary('places');

   useEffect(() => {
      if (!places || !inputRef.current) return;
  
      const options = {
        fields: ['geometry', 'name', 'formatted_address']
      };
  
      setPlaceAutocomplete(new places.Autocomplete(inputRef.current, options));
    }, [places]);
  
    useEffect(() => {
      if (!placeAutocomplete) return;
  
      placeAutocomplete.addListener('place_changed', () => {
        onPlaceSelect(placeAutocomplete.getPlace());
      });
    }, [onPlaceSelect, placeAutocomplete]);

  return (
   <div id="search-container">
      <span id="search-prompt">Search:</span>
      <div className="autocomplete-container">
       <input ref={inputRef} />
     </div>
   </div>
  );
};

export default AutocompleteSearch;