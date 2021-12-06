/* Creating database for the dataset on Child Care Regulated Programs */

/* Child Care Regulated Programs - Information on OCFS (Office of Children and Family Services &
 Division of Child Care Services) regulated childcare programs, which includes program overview
  information and violation history. */

/* The non normalized data contains 33 attributes and 15.2k tuples. This dataset will be modified
    and stored in a normalized schema */

DROP DATABASE IF EXISTS child_care_regulated_programs;
CREATE DATABASE child_care_regulated_programs;

DROP USER IF EXISTS child_care_admin;
CREATE USER child_care_admin WITH PASSWORD 'child_care';

GRANT ALL PRIVILEGES ON DATABASE child_care_regulated_programs TO child_care_admin;

ALTER DATABASE child_care_regulated_programs OWNER TO child_care_admin;

ALTER USER child_care_admin WITH SUPERUSER; 