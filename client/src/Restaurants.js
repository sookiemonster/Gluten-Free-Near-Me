import React from 'react'; 

function MapReferral({mapUri}) {
   return (
   <span className="refer-to-google">
      click to view on <a href={mapUri}>Google Maps</a>
   </span>
   );
}

function Review({author, body}) {
   return "";
}

function ReviewContainer({reviews}) {
   return "";
}

function Meal({name, description}) {
   let renderDescription = (description) ? (<span className="item-description"><q>{ description }</q></span>) : "";
   return (
      <div className="food-item">
         <span className="item-name">{ name }</span>
         { renderDescription }
      </div>
   );
}

function Menu({items}) {
   return (
      <div className="menu">
         { items.map((meal, index) => <Meal name={ meal.name } description={ meal.description } key = { index }/>) }
      </div>
   );
}

function GFOfferingType({gfrank, reviews, menu}) {
   switch (String(gfrank)) {
      case "3":
         return (
            <div className="offering-type green">
               <div className="box"></div>
               <span className="offering-description">Self-declared <b>GF</b></span>
            </div>
         );
      case "2": 
         return (
         <>
            <div className="offering-type yellow">
               <div className="box"></div>
               <span className="offering-description">Menu mentions <b>GF</b></span>
            </div>
            <Menu items={ menu } />
         </>
         );
      case "1":
         return (
         <>
            <div className="offering-type yellow">
               <div className="box"></div>
               <span className="offering-description">Reviews mention <b>GF</b></span>
            </div>
            <ReviewContainer reviews={ reviews } />
         </>
         );
      default:
         // But this should never actually happen...
         return (<div className="offering-type">
                  <div className="box"></div>
                  <span className="offering-description">No GF items</span>
               </div>);
   }

}

function Restaurant ({name, id, summary, rating, mapUri, gfrank, reviews=[], menu=[]}) {
   let DOMid = "card-" + id;

   return (
   <div className="restaurant-container" id={DOMid}>
      <div className="header">
         <span className="restaurant-name">{name}</span>
         <div className="rating" data-rating-value={rating}>
            <div className="stars"></div>
         <span className="rating-num">{ rating }</span>
         </div>
      </div>
      <span className="restaurant-description">{ summary }</span>
      <GFOfferingType gfrank={ gfrank } reviews={ reviews } menu={ menu } />
      <MapReferral mapUri={ mapUri }/>
   </div>
   );
}

export default Restaurant;