Homebuyer's Climate App

Overview: 
Buying homes and choosing where to live are some of the most significant choices many people make over the course of their lives. As climate change continues to alter weather patterns across the country, having access to basic real estate and weather information about a potential home and area could help an average home buyer or renter make a more informed decision. 

The Homebuyer's Climate App provides both relevant real estate data about a user submitted address as well as regional climate data showing weather trends that might influence a potential buyer or renter's decision about choosing where to live.

User Story: 
- As a potential homebuyer or renter, I want access to both real estate data and weather data that would help me make an informed decision about my home.

API's Used
- Zillow : Used to obtain a price estimate for an address, as well as an estimated range of home values in the neighborhood, as well as a neighborhood average home value.
- NOAA : The National Oceanic and Atmospheric Administration's vast database of weather and climate data. Used to access and calculate relevant weather data for a user submitted area. 
- SmartyStreets : Used to find the FIPS code (a federal county identification code) that is used to collect data from the NOAA API since weather data isn't often available at the Zip or City level.
- Google Streetview Static : Used to find the Streetview image of the user's address.

Front End
- Bulma 

Other Technologies Used:
- jQuery
- Chartist
