/* Creating tables inside child_care_regulated_programs database */

DROP TABLE IF EXISTS program_type CASCADE;
DROP TABLE IF EXISTS facility CASCADE;
DROP TABLE IF EXISTS facility_location CASCADE;
DROP TABLE IF EXISTS capacity CASCADE;
DROP TABLE IF EXISTS license CASCADE;
DROP TABLE IF EXISTS user_info CASCADE;
DROP TABLE IF EXISTS log_table CASCADE;

/* This table will hold the information about different program types */

CREATE TABLE program_type (
    program_type        VARCHAR(5) PRIMARY KEY,
    program_full_name   VARCHAR(31) UNIQUE
);

/* This is one of the main tables in the database, which contains the facility data which is referenced
    in all other tables */

CREATE TABLE facility (
    facility_id       INT PRIMARY KEY,
    facility_name     VARCHAR(127),
    facility_status   VARCHAR(31),
    program_type      VARCHAR(5) REFERENCES program_type ON UPDATE CASCADE ON DELETE SET NULL,
    facility_opened_date       DATE,
    provider_name     VARCHAR(63),
    phone_number        BIGINT CHECK ((phone_number > 999999999 AND phone_number <99999999999) OR phone_number = 0),
    address_omitted     VARCHAR(1),
    additional_information   VARCHAR(127)
);

/* This table contains high level information about the location of each facility. */

CREATE TABLE facility_location (
    facility_name       VARCHAR(127),
    street_number       VARCHAR(15),
    street_name         VARCHAR(41),
    additional_address  VARCHAR(127),
    floor               VARCHAR(15),
    apartment           VARCHAR(15),
    region_code         VARCHAR(10),
    county              VARCHAR(31),
    city                VARCHAR(31),
    state               CHAR(2) CHECK (LENGTH(state) = 2),
    zip_code            INT CHECK ((zip_code>9999 AND zip_code<=99999) OR zip_code = 0),
    school_district_name VARCHAR(31),
    latitude            DECIMAL,
    longitude           DECIMAL
);

/* This table contains data about the number of children enrolled in each facility, based on various age groups */

CREATE TABLE capacity (
    facility_id         INT REFERENCES facility ON UPDATE CASCADE ON DELETE CASCADE,
    facility_name       VARCHAR(127),
    program_type        VARCHAR(5),
    capacity_description VARCHAR(127),
    infant_capacity     INT,
    toddler_capacity    INT,
    preschool_capacity  INT,       
    school_age_capacity INT    
);

/* This table contains licencing data for each facility  */

CREATE TABLE license (
    facility_id         INT REFERENCES facility ON UPDATE CASCADE ON DELETE CASCADE,
    license_issue_date  DATE,
    license_expiration_date DATE
);

/* This table contains the login information for each user of the application */

CREATE TABLE user_info (
    userid              VARCHAR(15) PRIMARY KEY,
    user_role           VARCHAR(15)
);

/* This table contains the audit logs for each user, to keep track of the data accessed by them */

CREATE TABLE log_table (
    userid              VARCHAR(31),
    dbname              VARCHAR(31),
    table_name          VARCHAR(127),
    parameters_accessed VARCHAR(127),
    access_timestamp    TIMESTAMP
);

/* Insert Admin role into user_info table */

INSERT INTO user_info VALUES ('Admin', 'admin');