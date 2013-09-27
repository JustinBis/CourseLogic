####################################
## CourseLogic PostgreSQL Updater ##
## By Justin Bisignano            ##
## Fall 2013                      ##
####################################

"""
    This script takes well formatted json data, parses it, and then
    attempts to inset the data into a PostgreSQL database for use by the
    CourseLogic server.
    Requires psycopg2 to be installed as the PostgreSQL driver
    The json should be formatted as described in the README
"""

"""
TODO:
   - Rework functions to use a single conenction throughout their operations (Truncate and Add)
   - Abstract the update functions and the format functions, if possible
   - Create suite of tests to make sure this module can work with external calls
"""

####################
## USER VARIABLES ##
####################

classes_json_file = 'scrapedClasses.json' # Filename for the JSON data containing the class listings
subjects_json_file = 'scrapedSubjects.json' # Filename for the JSON data containing the class listings

db_config = {
   'user'     : 'user', #PostgreSQL Username
   'password' : 'pass', #PostgreSQL Password
   'host'     : 'host', #PostgreSQL Host
   'database' : 'dbname', #PostgreSQL Database Name
}

verbose_debug = True # Debug verbosity. Set to true to print extra information.


################
## Begin Code ##
################
import json
import psycopg2 as pg


# Main function to be run when this script is called directly
def main():
   # Prompt the user, asking about what they want to do
   print("Welcome to the CourseLogic PostgreSQL Database Updater")
   print("Which table do you want to update:\n1. Class Options\n2. Class Topics\n3. Subjects")
   response = raw_input("Enter a number: ")
   if response == "1":
      updateClassOptions(loadJSON(classes_json_file))
   elif response == "2":
      updateClassTopics(loadJSON(classes_json_file))
   elif response == "3":
      updateSubjects(loadJSON(subjects_json_file))
   else:
      print("Well that's not an option. Way to go. Bye!")


# Function to update the ClassOptions table with new classes. jsonData should be passed as an already loaded dictionary
def updateClassOptions(jsonData):
   # First, truncate the table to drop all of the old data.
   # It's far more efficient and less error prone then scanning for changes
   print("Emptying the class options table...")
   executeSQL("TRUNCATE ClassOptions;")

   # The SQL insert statement to use
   stmt = "INSERT INTO ClassOptions (crn, classID, prof, times) VALUES (%s, %s, %s, %s)"

   # Interpret the data so that we can use it for the above SQL statement
   formattedData = formatClassOptionDataForSQL(jsonData)

   # Run the SQL statement
   executeSQL(stmt, formattedData)


# A function to update the ClassTopics table from the given scraped classes data
def updateClassTopics(jsonData):
   # First, truncate the table to drop all of the old data.
   # It's far more efficient and less error prone then scanning for changes
   print("Emptying the old class topics table...")
   executeSQL("TRUNCATE ClassTopics;")

   # The SQL statement to use
   stmt = "INSERT INTO ClassTopics (subjectID, classID, className) VALUES (%s, %s, %s)"

   # Interpret the data
   formattedData = formatClassTopicDataForSQL(jsonData)

   # Run the statement
   executeSQL(stmt, formattedData)
   

# A function to update the Subjects table based on the given scraped subjects data.
def updateSubjects(jsonData):
   # First, truncate the table to drop all of the old class options.
   # It's far more efficient and less error prone then scanning for changes
   print("Emptying the subjects table...")
   executeSQL("TRUNCATE Subjects;")

   # The SQL statement to use
   stmt = "INSERT INTO Subjects (subjectID, subjectName) VALUES (%s, %s)"

   # Interpret the data
   formattedData = formatSubjectDataForSQL(jsonData)

   # Run the statement
   executeSQL(stmt, formattedData)


# A function to safely execute the given SQL statement using the passed data
def executeSQL(stmt, formattedData=None):
   # Create a connection to the SQL database
   connection = createConnection(db_config)

   # Create a cursor object that will allow us to insert new data
   cursor = connection.cursor()
   
   # Using the statement and formatted data, exectute the SQL statement
   # Note that using executemany() allows data to be given as an array of tuples
   if verbose_debug: print("Attempting to execute the SQL statement")
   
   try:
      if(formattedData):
         cursor.executemany(stmt, formattedData)
      else:
         cursor.execute(stmt)
   except pg.Error as e:
      print("Error executing the SQL statement. Error was:")
      print(e.pgerror)
      # Undo any changes to the database and close the connection
      print("Rolling back any changes made during this run")
      connection.rollback()
      connection.close()
      return False
   except pg.Warning as e:
      print("Warning during SQL Execution:")
      print(repr(e))
   
   if(cursor.rowcount != -1): # Rowcount is -1 when the rowcount can't be determined, e.g. when a table is truncated
      print(str(cursor.rowcount)+" rows will be affected.")
   
   # Prompt the user to make sure they want to commit the change
   if prompt("Are you sure you want to commit this change?"):
      connection.commit()
      print("Successfully committed the changes")
   else:
      connection.rollback()
      print("Successfully rolled back the transaction without commiting any changes")
      
   # Finally, close the connection
   connection.close()


# Create a PostgreSQL connection using the passed config dictionary
# Returns a connection object if successful, else returns None
def createConnection(config):
   if verbose_debug: print("Attempting to create a PostgreSQL Connection")
   try:
      return pg.connect(**config)
   except pg.Error as e:
      print("Unexpected Error when creating the connection:")
      print(e.pgerror)
      raise e # Elevate the error since this is fatal
   

# Function to load JSON data from a given file. Returns a dictionary with the loaded data.
def loadJSON(data):
   jsonFile = open(data)
   jsonData = json.load(jsonFile)
   jsonFile.close()
   print("Successfully loaded the JSON file")
   return jsonData


# Function to interpret the passed class data dict into a list of tuples useable for SQL
def formatClassOptionDataForSQL(data):
   if verbose_debug: print("Formatting Class Option Data")
   # Create a list to store the data
   output = []

   # Loop through each course, making sure to get it's key. (Won't work in Python 3.x thanks to .iteritems())
   for key, value in data.iteritems():
      # Loop through each section in each course
      for crn, section in data[key]['sections'].iteritems():
         # Create the tuple to match (crn, classID, prof, times) in the SQL statement
         t = ( str(crn), str(key), str(section['prof']), json.dumps(section['times']) )
         output.append(t)

   return output


# Function to interpret the passed class data dict into a list of tuples
def formatClassTopicDataForSQL(data):
   if verbose_debug: print("Formatting Class Topic Data")
   # Create a list to store the data
   output = []
   length = 0
   # Loop through each course, but only grab the classID and the className as that's all we need
   for key, value in data.iteritems():
      # Create the tuple to match (subjectID, classID, className) in the SQL statement
      subjectID = key.split("-")[0]
      # Try to create the needed tuple. This might fail with non-ascii characters such as a french class
      try:
         t = ( str(subjectID), str(key), str(data[key]['className']) )
         output.append(t)
      except UnicodeEncodeError as e:
         if verbose_debug:
            print("Error converting class data to strings. Class was: "+key+": "+data[key]['className'])

   return output


# Function to interpret the passed subject data dict into a list of tuples useable for SQL
def formatSubjectDataForSQL(data):
   if verbose_debug: print("Formatting Subject Data")
   # Create a list to store the data
   output = []

   # Loop through each course, making sure to get it's key. (Won't work in Python 3.x thanks to .iteritems())
   for key, value in data.iteritems():
      # Create the tuple to match (subjectID, subjectName) in the SQL statement
      t = ( str(key), str(value) )
      output.append(t)

   return output


# Function to prompt a user yes or no. Returns True for yes, False for no.
def prompt(string):
   response = raw_input(string+" y/n: ").lower()
   if response == "y":
      return True
   elif response == "n":
      return False
   else:
      # If the input was bad, notify the user and then recursivly call this function
      print('No really, just type "y" or "n" and hit enter')
      return prompt(string)
      


# And now that everything is defined, actually run the program!
if __name__=="__main__":
   main()
