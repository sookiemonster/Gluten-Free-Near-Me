import React from 'react'; 
import { useSelector } from 'react-redux'

function MapReferral({mapUri}) {
   return (
   <span className="refer-to-google">
      click to view on <a href={mapUri}>Google Maps</a>
   </span>
   );
}

function Review({author, body, rating}) {
   return (
   <div className="review">
      <span className="review-author">{ author }</span>
      <Rating ratingValue={rating} />
      <span className="review-body"><q>{ body }</q></span>
   </div>
   );
}

function ReviewContainer({reviews}) {
   return (
      <div className="offering-container">
         { reviews.map((review, index) => <Review author={review.author} body={review.text} rating={review.rating} key={index}/>)}
      </div>
   );
}

function Meal({name, description}) {
   let renderDescription = (description) ? (<span className="item-description"><q>{ description }</q></span>) : "";
   return (
      <div className="food-item">
         <span className="item-name">{ name.toLowerCase() }</span>
         { renderDescription }
      </div>
   );
}

function Menu({items}) {
   return (
      <div className="offering-container">
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
            <div className="offering-type brown">
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

function Rating({ratingValue}) {
   if (ratingValue === null) {
      return <div className="rating"></div>
   }

   ratingValue = Number(ratingValue);

   // Star path attribution: https://icons.getbootstrap.com/icons/star-fill/
   let starPath = <path id="star" d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"/>
   let starWidth = 16;
   let gap = 4;

   let bgColor = "#d1cdcd";

   return (
   <div className="rating">
      <div className="stars">
         <svg height={starWidth} width={(starWidth + gap) * 5}> 
         <defs>
            { starPath }
            <svg id="all-stars">
               {/* Make 5 stars*/}
               { [...Array(5).keys().map((i) => <use key={i} href="#star" x={i * (starWidth + gap)} y="0" />)] }
            </svg>
         </defs>
         <clipPath id="clip-stars">
            {/* Make 5 stars as a clipping mask */}
            { [...Array(5).keys().map((i) => <use key={i} href="#star" x={i * (starWidth + gap)} y="0" />)] }
         </clipPath>
         {/* Extend a rectangle scaling by the rating */}
         <use href="#all-stars" fill={bgColor} />
         <rect x="0" y="0" width={ratingValue * 16 + (ratingValue -1 ) * 4} height="50" clipPath="url(#clip-stars)" />
         </svg>
      </div>
   <span className="rating-num">{ ratingValue }</span>
   </div>
   );
}

function Restaurant ({name, id, summary, rating, mapUri, gfrank, reviews=[], menu=[]}) {
   let DOMid = "card-" + id;

   return (
   <div className="restaurant-container" id={DOMid}>
      <div className="header">
         <span className="restaurant-name">{name}</span>
         <Rating ratingValue={rating}/>
      </div>
      <span className="restaurant-description">{ summary }</span>
      <GFOfferingType gfrank={ gfrank } reviews={ reviews } menu={ menu } />
      <MapReferral mapUri={ mapUri }/>
   </div>
   );
}

function Restaurants() {
   let restaurants = useSelector((state) => state.restaurants.resList); 

   return (
   <div id="restaurants">
      { restaurants.map((place) => <Restaurant key={place.id} name ={place.name} id={place.id} summary={place.summary} rating={place.rating} mapUri={place.mapuri} gfrank={place.gfrank} reviews={place.reviews} menu={place.items} /> )}
   </div>
   );
}

export default Restaurants;