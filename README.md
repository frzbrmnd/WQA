# Water_Quality_Assessment
Water_Quality_Assessment is a full-stack web application developed as a freelance project to support environmental monitoring and water-quality assessment. The system combines a JavaScript frontend with a PHP/PostgreSQL backend, and includes Python-based machine learning scripts to estimate key environmental parameters and compute several water-quality indices.

Although originally built for a client, the project also represents my skills in data-driven Python analytics, web development, and geospatially relevant data workflows, which align closely with my academic and research interests.

# Project Overview

This application is designed for non-expert decision-makers and stakeholders involved in water-quality monitoring and management.
It provides:

- Automated computation of several water-quality indices, including trophic-state indicators and vulnerability-related metrics
- Collecting and validating water-quality inputs

- Two ML models implemented in Python for predicting environmental quality parameters

- A clean and accessible web-based dashboard

- Running asynchronous AJAX operations for efficient data communication

- Storing structured environmental data in PostgreSQL

- A reliable, scalable PostgreSQL structure for storing measurements and model outputs


# Key Features

### Python-Based Parameter Estimation (Machine Learning Models)
This project includes Python scripts that train and deploy XGBoost regression models to estimate key water-quality parameters such as Chlorophyll-a (CHLA) and Dissolved Oxygen (DO). Historical monitoring datasets are used for training, and models are exported as .sav files for backend use.

The deployed CGI scripts:

- Load the trained models

- Process and validate user inputs

- Apply 5-day weighted averaging

- Generate real-time predictions for environmental parameters

- Return results to the PHP/JavaScript frontend for visualization

These machine-learning components enable non-expert users to obtain accurate, data-driven estimates that support water-quality assessment and index calculations.

### PostgreSQL Database Integration

The backend uses PostgreSQL to:

- Store user input data

- Organize computed indices and model outputs

- Log results and maintain a consistent data structure

- Support future extensions such as geospatial layers (PostGIS-ready)

# Technologies Used

- Python 3.x — ML models & parameter estimation

- PostgreSQL — primary database

- PHP — backend logic & authentication

- JavaScript / AJAX — client–server interaction

- HTML / CSS — UI layer

- JSON — data exchange format
