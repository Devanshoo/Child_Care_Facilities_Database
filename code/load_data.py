#!/usr/bin/env python
# coding: utf-8

import requests
import csv
import pandas as pd
import json
import io
import psycopg2
from datetime import datetime
from requests.exceptions import HTTPError

#Fetching main data set from data.ny.gov

child_care_api = "https://data.ny.gov/resource/cb42-qumz.csv?$limit=20000"

try:
    response = requests.get(child_care_api)
    response.raise_for_status()


except HTTPError as http_err:
    print('HTTP error occurred:',http_err)

except Exception as err:
    print('Other error occurred:',err)

content = response.content

df = pd.read_csv(io.StringIO(content.decode('utf-8')))

#Filling null values with 0

df = df.fillna(0)

# Preparing dataframes as per the designed schema

#TABLE 1
program_type_df = df[['program_type']]
program_type_df = program_type_df.drop_duplicates()

program_type_df['program_full_name'] = program_type_df
program_type_df['program_full_name'] = program_type_df['program_full_name'].map({"FDC":"Family Day Care","GFDC" :"Group Family Day Care","SACC": "School Age Child Care", "DCC":"Day Care Center","SDCC":"Small Day Care Center"})

program_type_df = program_type_df.reset_index(drop = True)

#TABLE 2
facility_df = df[['facility_id','facility_name','facility_status','program_type','facility_opened_date','provider_name','phone_number','address_omitted','additional_information']]
facility_df['phone_number'] = (facility_df['phone_number']).astype('str')
facility_df['phone_number'] = facility_df['phone_number'].apply(lambda x: x.replace('(','').replace(')','').replace('-',''))
facility_df['phone_number'] = (facility_df['phone_number']).astype('int64')

#TABLE3
facility_location_df = df[['facility_name','street_number','street_name','additional_address','floor','apartment','region_code','county','city','state','zip_code','school_district_name','latitude','longitude']]
facility_location_df['zip_code'] = facility_location_df['zip_code'].apply(lambda x: int(x/10000) if (x >99999) else (x))

#TABLE4
capacity_df = df[['facility_id','facility_name','program_type','capacity_description','infant_capacity','toddler_capacity','preschool_capacity','school_age_capacity']]

#TABLE5
license_df = df[['facility_id','license_issue_date','license_expiration_date']]

#Establishing connection to Postgre servers

def script_execute(filename):
    open_file = open(filename, 'r')
    sqlFile = open_file.read()
    open_file.close()
    
    sqlCommands = sqlFile.split(';')
    sqlCommands.pop()
    postgresConnection = psycopg2.connect("dbname=child_care_regulated_programs user=child_care_admin password='child_care'")
    cursor = postgresConnection.cursor()

    for command in sqlCommands:
        try:
            cursor.execute(command + ';')
        except Exception as err:
            print('ERROR:',err)
    postgresConnection.commit()


filename = "schema.sql"
script_execute(filename)

#Inserting records into postgres

def insert_records_intotable(df, table):
   
    postgresConnection = psycopg2.connect("dbname=child_care_regulated_programs user=child_care_admin password='child_care'")
    cursor = postgresConnection.cursor()
    tuples = [tuple(x) for x in df.to_numpy()]
    cols = ','.join(list(df.columns))
    num_cols = len(df.columns) - 1

    query = ("INSERT INTO %s(%s) VALUES (%%s" + ',%%s' * num_cols + ')') % (table, cols)
    cursor = postgresConnection.cursor()
    try:
        cursor.executemany(query, tuples)
        postgresConnection.commit()
    except (Exception, psycopg2.DatabaseError) as error:
        print("ERROR: %s" % error)
        cursor.close()
        return 1
    print("execute_many() done")
    cursor.close()


insert_records_intotable(program_type_df, 'program_type')
insert_records_intotable(facility_df, 'facility')
insert_records_intotable(facility_location_df, 'facility_location')
insert_records_intotable(capacity_df, 'capacity')
insert_records_intotable(license_df, 'license')


# Connecting and storing supporting dataset into MongoDB 

import pymongo

child_welfare = requests.get("https://data.ny.gov/resource/ahjq-dbec.json?$limit=20000")

content_1 = child_welfare.json()

myclient = pymongo.MongoClient("mongodb+srv://shlokshah18:qwerty123@shlokscluster.lhxvc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority")
welfare_db = myclient["ChildWelfare"]
welfare_table = welfare_db["WelfareInfo"]
welfare_table.drop()
welfare_table.insert_many(content_1)
