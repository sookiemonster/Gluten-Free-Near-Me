let findNearby = async() => {
   console.log("click!");
   const data = {"lat" : 0, "long" : 0};
   const options = {
      method: "Post", 
      headers: { "Content-Type" : "application/json"},
      body: JSON.stringify(data)
   }

   fetch("https://localhost:5000/api/find-nearby", options)
      .then((response) => { return response.json() })
      .then((resJson) => console.log(resJson))
      .catch((error) => console.error("An error has occurred: " + error));
}

export { findNearby };