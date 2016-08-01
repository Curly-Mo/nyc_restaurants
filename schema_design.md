# Schema Design

The denormalized data was rather awkward to parse with a line per violation.
I decided to mostly normalize the data (except for grade/grade_date) to have an entity per restaurant, with a list of pointers to all of it's inspections. Each inspection entity contains a list of pointers to all of it's violations.

Violations with the same Restaurant_id/Inspection_date pair were considered to be part of a single Inspection.

The Restaurant grade and grade_date are kept up to date in the Restaurant entity. I made this decision because it seems to me that inspection history is not important and the relevant information is in the latest inspection. Though the grade history could still be found by parsing a Restaurants list of inspections.


Restaurant  
  * id  
  * dba  
  * boro  
  * building  
  * street  
  * zipcode  
  * phone  
  * cuisine_description  
  * grade  
  * grade_date  
  * record_date  
  * Inspections[]  

Inspection  
  * Restaurant  
  * date  
  * action  
  * Violations[]  
  * score  
  * grade  
  * grade_date  
  * record_date  
  * type  

Violation  
  * code  
  * description  
  * critical_flag  
