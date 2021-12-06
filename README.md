# Your Project

Out database application contains Information on OCFS regulated child care programs, which includes program overview information and violation history. A user can search facilities by Facility Name or City and use the filter dropdown options to filter facilities based on Program Type, Facility Status or County

## Data

1. The main dataset was downloaded from data.ny.gov by hitting the API. The data can also be downloaded in .csv format from the following link:

    LINK: https://data.ny.gov/Human-Services/Child-Care-Regulated-Programs/cb42-qumz 

    The owner of the dataset is OCFS Division of Child Care Services and the data is being updated on a daily basis.

2. The supporting dataset was also fetched from data.ny.gov using API hit. The link for the dataset is given below:

    LINK: https://data.ny.gov/Human-Services/Child-Welfare-and-Community-Services-Funded-Progra/ahjq-dbec

    This dataset contains elements that can help the public identify all the programs currently funded by the New York State Office of Children and Family Services' (OCFS) Division of Child Welfare and Community Services (CWCS). We are leveraging this dataset to provide users information about these funded programs for the area where they are searching for Child Care Programs using the zipcode of the facilty. 


## Prerequisites 

Since our application is built using Node.js to display the UI of the application and handle user requests, you need to install Node.js as a prerequisite.

1. Install Node.js on your system by clicking the below link:

    LINK: https://nodejs.org/en/download/ 

2. After installation make sure that /usr/local/bin is in your $PATH.


## Build

To build the project and run it successfully, you need to install the required python packages first.
Steps to install the required packages -
1. Navigate to the `Submission_Folder` folder
2. Run the command `pip install -r requirements.txt`

## Run

To run the application, we have created a bash script `execute.sh` which does the following things in order -
1. Executes the `setup.sql` file as a postgres user
2. Runs the `load_data.py` file to fetch the data and load it into the Postgres Database. It also establishes a connection with MongoDB and inserts the supporting dataset into it.
3. Navigates to the `childcare_db` folder
4. Installs all the required node modules
5. Runs the node application on the port 3000

Steps to execute the bash script -
1. Navigate to the code directory using `cd code`
2. Run the command `bash execute.sh`

When the bash script runs successfully, you will see 2 messages on your console - 

1. listening on 3000
2. Connected to Mongo Database

After you see these 2 messages, this implies that the application is successfully built and is now running on your local machine

Go to the link - http://localhost:3000 to interact with the application

NOTE: Since the supporting dataset contains less number of datapoints as compared to the main dataset, you might see No Data Being Displayed for most zipcodes.

So follow the below steps as a use case to display main data as well as supporting data.

## Example Use Case

1. Login using a 'User ID'
2. Search for the Facility Name using the keyword 'Amber' and select 'Amber Charter School'
3. You will be navigated to a new page with details of Capacity of the Facility selected and the Funded programs in that particular region



