###############################
## CourseLogic MySQL Updater ##
## By Justin Bisignano       ##
## Fall 2013                 ##
###############################

"""
    This script takes well formatted json data, parses it, and then
    attempts to inset the data into a MySQL database for use by the
    CourseLogic server.
    The json should be formatted as follows:
        -
"""

####################
## USER VARIABLES ##
####################

json_file = 'scraperOutput.json' # Filename for the JSON data

db_config = {
   'user'     : 'CourseLogicAdder', #MySQL Username
   'password' : '7GmFSF6nQUcYVr6G', #MySQL Password
   'host'     : '66.172.33.243', #MySQL Host
   'database' : 'CourseLogic', #MySQL Database Name
   'raise_on_warnings': True # Will raise errors on MySQL warnings. Only set to false if you're brave and/or keep good backups.
}

verbose_debug = True # Debug verbosity. Set to true to print extra information.


################
## Begin Code ##
################
import json
import mysql.connector as mysql
from mysql.connector import errorcode


# Main function to be run when this script is called directly
def main():
   # Open the json file listed in the settings above
   jsonData = loadJSON(json_file)
   # Prompt the user, asking about what they want to do
   print("Welcome to the CourseLogic MySQL Updater")
   print("Which table do you want to update:\n1. Class Options\n2. Subject Listings")
   response = raw_input("Enter a number: ")
   if response == "1":
      updateClassOptions(jsonData)
   elif response == "2":
      updateSubjects(jsonData)
   else:
      print("Well that's not an option. Way to go. Bye!")

# Function to update the ClassOptions table with new classes. jsonData should be passed as an already loaded dictionary
def updateClassOptions(jsonData):
   # The MySQL statement to use
   stmt = "REPLACE INTO ClassOptions (crn, classID, prof, times) VALUES (%s, %s, %s, %s)"

   # Interpret the data so that we can use it for the above MySQL statement
   formattedData = formatClassDataForMysql(jsonData)

   # Create a connection to the MySQL database
   if verbose_debug: print("Attempting to create a MySQL Connection")
   connection = createConnection(db_config)
   if connection == False:
      return
   # Create a MySQL cursor object that will allow us to insert new data
   cursor = connection.cursor()
   
   # Using the statement and formatted data, exectute the MySQL statement
   # Note that using executemany() allows data to be given as an array of tuples
   print("Attempting to execute the SQL statement")
   cursor.executemany(stmt, formattedData)
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


# A function to update the Subjects tables based on the given json data.
def updateSubjects(jsonData):
   pass


# Create a MySQL connection using the passed config dictionary
# Returns a MySQL connection object
def createConnection(config):
   try:
      return mysql.connect(**config)
   except mysql.Error as e:
      if e.errno == errorcode.ER_ACCESS_DENIED_ERROR:
         print("Bad Username/Password. Check the db_config dictionary.")
      elif e.errno == errorcode.ER_BAD_DB_ERROR:
         print("The selected database doesn't exist. Check the db_config dictionary.")
      else:
         print("Unexpected Error when creating the MySQL connection:")
         print(e)
      return False

# Function to load JSON data from a given file. Returns a dictionary with the loaded data.
def loadJSON(data):
   jsonFile = open(data)
   jsonData = json.load(jsonFile)
   jsonFile.close()
   return jsonData

# Function to interpret the passed class data into a list of tuples useable for MySQL
def formatClassDataForMysql(data):
   # Create a list to store the data
   output = []

   # Loop through each course, making sure to get it's key. (Won't work in Python 3.x thanks to .iteritems())
   for key, value in data.iteritems():
      # Loop through each section in each course
      for crn, section in data[key]['sections'].iteritems():
         # Create the tuple to match (%(crn)s, %(classID)s, %(prof)s, %(times)s) in the MySQL statement
         t = ( str(crn), str(key), str(section['prof']), json.dumps(section['times']) )
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
