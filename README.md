# Gluten Free Near Me
A web-application to find restaurants offering gluten-free options near you! 

![image](https://github.com/sookiemonster/Gluten-Free-Near-Me/assets/71859934/311ebd28-a961-4602-972a-1d8f5dd1a740)

## Upcoming mobile design:

![iPhone 15, 15 Pro-6](https://github.com/user-attachments/assets/e3ee031f-4f71-420d-a71e-b34ec6e5f9e8)
![iPhone 15, 15 Pro-5](https://github.com/user-attachments/assets/d6780dcc-9053-4502-9a11-eaad444cf0f2)
![iPhone 15, 15 Pro-4](https://github.com/user-attachments/assets/147efe15-6b8f-4910-85e4-53a9f4c6b4b8)
![iPhone 15, 15 Pro-3](https://github.com/user-attachments/assets/b2df6ea2-70c0-4414-a8ff-9175f1bd353f)
![iPhone 15, 15 Pro-2](https://github.com/user-attachments/assets/ebecbe7c-142e-483f-b975-be6c2398951c)
![iPhone 15, 15 Pro-1](https://github.com/user-attachments/assets/c29017b0-4824-482b-88ff-e5a65dc4d53a)


## Behind the Scenes / How it works:
There aren't any widely accessible APIs to retrieve menu information; but if we can Google it, then chances are we can get it (for the most part, see later). 
1. First we see if Google has already done the work for us. That is to say, if a restaurant's description mentions gluten-free right off the bat, then we can save some work and avoid scraping. 
2. The same applies to reviews. If a customer did the work already and has a testimonial of being served GF food, we simply go with that. Oftentimes, restaurants may not explicitly label items to be gluten-free, but customers go in, ask, and find out that some products are. We take that into account as well.  
3. If all else fails, we web-scrape the menu information, provided the menu is available via foods.google. Some menu providers (eg. DoorDash, Grubhub, etc.) prohibit web-scraping, so if we can't access the menu, we, unfortunately, can't scrape it.

## Current Limitations & Caveats
- We don't guess if something is gluten-free. If a review doesn't mention GF or a menu item isn't explicitly labeled, then we can't say for certain that the restaurant will provide gluten-free options. There may *still* be GF options in the area, but it's just not visible from the data. 

## To-do
- Support other menu providers (eg. find a way to get  menus of restaurants that don't allow ordering online via foods.google)
