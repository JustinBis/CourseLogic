from __future__ import print_function # Because 2.7 print statements are stupid
###########################
## Banner Course Scraper ##
## By Justin Bisignano   ##
## Fall 2013             ##
###########################

"""
    You can call the scraper itself from another python script by
    importing CourseScraper and then calling CourseScraper.scrapePage(html)
    with html either being the HTML as text or an opened HTML file via open()
"""

####################
## USER VARIABLES ##
####################

# The location of the saved HTML file containing all class listings on Banner
# Get from https://ssbprod.auburn.edu/pls/PROD/bwckschd.p_disp_dyn_sched
# and the select all classes in the term
# Only needs to be set if we're running this file directly
classes_schedule_htmlfile = "all_classes.html"
subjects_htmlfile = "subject_list.htm"

# Output filename for the scraped classes. Should be "scrapedClasses.json"
classes_output_filename = 'scrapedClasses.json'

# Output filename for the scraped subjects. Should be "scrapedSubjects.json"
subjects_output_filename = 'scrapedSubjects.json'

# Debug verbosity. Set to True if you want errors to print in full, or False for short errors
verbose_debug = True

################
## Begin Code ##
################
from bs4 import BeautifulSoup
import sys, json

# Create an empty global dictionary to hold all of the course info
global_courseDict = {}

# If this script is run directly, main will be run
def main():
    # Prompt the user, asking about what they want to do
    print("Welcome to the CourseLogic Banner HTML Scraper")
    print("Which page do you want to scrape:\n1. Class Options\n2. Subject Listings")
    response = raw_input("Enter a number: ")
    if response == "1":
        #we'll just pass in the html page specified at the start and then pass it to the interpreter.
        print("Parsing the Class Options HTML file. This may take a while...")
        scrapedCourses = scrapeClassPage(open(classes_schedule_htmlfile))
        saveDictToFile(scrapedCourses, classes_output_filename)
    elif response == "2":
        print("Parsing the Subject Listings HTML file. This shouldn't take long...")
        scrapedSubjects = scrapeSubjectsPage(open(subjects_htmlfile))
        saveDictToFile(scrapedSubjects, subjects_output_filename)
    else:
        print("Well that's not an option. Way to go. Bye!")


def scrapeClassPage(html):
    soup = BeautifulSoup(html, "html5lib") # Use lxml as it's much faster. Must be installed locally
    print("Page parsed. Starting to scrape data:")
    mainTable = soup.find(class_="datadisplaytable").tbody.extract()
    firstRow = mainTable.find("tr")

    # Loop through each sibling, skipping each "u'\n'" sibling seperating lines
    progress = 0
    for sibling in firstRow.next_siblings: 
        # Go back one from each so we can process the first row, and we'll skip the last since it's a "\n" row
        row = sibling.previous_sibling
        
        # If the sibling is one of the "u'\n'" strings, skip it and continue iterating
        if(row == "\n"):
            continue

        # If the sibling is a title row, let's save the location and use it next iteration
        # Title rows are marked by having a th with the class 'ddtitle'
        elif(row.find('th', class_='ddtitle')):
            headerRow = row.find('th', class_='ddtitle')
            continue

        else:
            # Show progress, as this can take a long time
            progress += 1
            sys.stdout.write('\rProcessing row number ' + repr(progress))
            sys.stdout.flush()
            # Try to process the <tr>
            try:
                processHTMLMainTableRow(row, headerRow)
            except RowProcessingError as e:
                # In the event of an error, print the error message and continue on to the next sibling
                if(verbose_debug):
                    print(repr(e))
                    print(repr(headerRow))
                    print(repr(row))
                continue

    else: # Executes only if the loop completes successfully
        print("\nSuccessfully looped through all rows to scrape data")
        print("Collected info on", len(global_courseDict.keys()), "classes.")
        return global_courseDict


# Function to handle a given BeautifulSoup reference to a <tr>
# Reroutes based on the data in the tr so we can handle titles and times differently
def processHTMLMainTableRow(dataRow, headerRow):
    # Data rows are marked by having a sub-table containing class times
    if(dataRow.find('tbody')):
        dataTable = dataRow.find('tbody')
    elif(dataRow.find('span')):
         # In this case, it's probably a class that is listed, but has no times. Just return False and move on.
         return False
    else:
        # Raise an error if the dataRow isn't actually a data row containing a table with times
        raise RowProcessingError("Failure in processMainTableRow. The passed dataRow couldn't be matched to a known row type", dataRow)

    # Extract data from the headerRow
    try:
        # The header should follow the format "Name - CRN - classID - Section#"
        # HOWEVER, certain namees have a "-" in them, so we have to check for that case and index everything from the end
        headerList = headerRow.a.text.split(" - ")
        
        crn = headerList[-3] # Thrid to last is the crn
        # Replace the space in classID with a '-' for easier compatibility later
        classID = headerList[-2].replace(' ', '-') # Second to last is classID

        # Handle the special cases of classNames with a dash in them
        # If there are 4 elements, it's a normal class
        if len(headerList) == 4:
            className = headerList[0]
        else:
            # Otherwise, get everything but the last three elements and then join them back together with " - "
            className = ' - '.join(headerList[0:-3])
        
    except IndexError as e:
        if(verbose_debug):
            print("Error extracting data from headerRow. Row was:")
            print(repr(headerRow))
        return False
    

    # Set the current class to the course's dictionary entry
    currentClass = {'className': className, 'sections': {}}

    # Create an entry in currentClass for the current course's crn
    currentClass['sections'][crn] = {'times': [] }

    # Set the current course to the currentClass's sections' crn
    currentSection = currentClass['sections'][crn]

    # Extract data from the dataTable
    for row in dataTable.tr.next_siblings:
        # Skip empty siblings
        if(row == "\n"):
            continue
        
        # Create a times dictionary to gather data before inserting it into currentSection
        times = {}
        # Loop through each <td> in each class time row
        index = 0
        for td in row.find('td').next_siblings:
            
            
            # Go back a sibling since next_siblings always starts with the second, and the last is always just "\n" anyway
            data = td.previous_sibling
            
            # Skip empty siblings
            if(data == "\n"):
                continue
            else:
                # Match the data in the <td> to the appropriate variable
                data = data.text
                if index == 0: # Type
                    times['type'] = data
                elif index == 1: # Time
                    times['time'] = data
                elif index == 2: # Days
                    times['days'] = data
                elif index == 3: # Where
                    times['location'] = data
                elif index == 4: # Date Range
                    pass
                elif index == 5: # Schedule Type                    
                    times['scheduleType'] = data
                elif index == 6: # Instructor
                    # Handle this differently, as we don't need to repeatedly store the professor
                    # Clean up the extra (P) at the end of every professor's name, and ignore everything after it, including extra professors
                    professor = data.split(' (P)')[0]
                    # Only ever store the first professor listed
                    if 'prof' not in currentSection:
                        currentSection['prof'] = professor
                else:
                    if verbose_debug:
                        print('Encountered an unexpected index while processing the times rows. Row was:')
                        print(repr(row))

                # Increment the index each time so we can keep track of which column we are examining
                index += 1
        # END for td
        
        # Now that we have all of the information from the td, add the times entry
        currentSection['times'].append(times)
    #END for row

    # Verify that the course is one we want to add to the global_courseDict
    # If the Time is TBA or if the Schedule Type is one of the following, skip it
    skipTypes = ['Distance Learning', 'Internsip', 'Practicum',
                 'Independent Study', 'Distance RSE 1', 'Distance Reading Ed',
                 'Distance Foreign Lang Ed', 'Distance C&T ESOL', 'Distance Music Education']
    skip = False

    # For each time block in the times list
    for timeblock in currentSection['times']:
        if timeblock['time'] == "TBA":
            skip = True
        elif timeblock['scheduleType'] in skipTypes:
            skip = True

    # If the class is good, add it to the global_courseDict
    if not skip:
        if classID not in global_courseDict:
            # If there haven't been any classes of this ID added yet, create a new ID with full info
            global_courseDict[classID] = currentClass
        else:
            # Otherwise, just add the crn to the sections dict, so we don't overwrite the other information
            global_courseDict[classID]['sections'][crn] = currentSection


# Function to scrape the subjects list page for the 4 character subject codes and their associated names.
def scrapeSubjectsPage(html):
    soup = BeautifulSoup(html, "lxml") # Use lxml as it's much faster. Must be installed locally
    print("Page parsed. Starting to scrape data.")
    selectElement = soup.find(id="subj_id").extract()

    # Create a dictionary to track the subjects
    subjectsDict = {}
    
    # Iterate over each child <option> tag in the <select> field
    for option in selectElement.children:
        # Skip blank tags
        if(option == "\n"): continue
        
        subjectID = option['value']
        subjectName = unicode(option.string).replace("\n", "") # Remove newline characters

        # Add the subject to the subject dictionary as long as it isn't a duplicate for some reason
        if subjectID in subjectsDict:
            print("Warning: Duplicate class detected, ignoring: "+subjectID+": "+subjectName)
            continue
        subjectsDict[subjectID] = subjectName

    return subjectsDict


# Function to save the dictionary in a json file
def saveDictToFile(dictionary, filename):
    f = open(str(filename), 'w')
    if verbose_debug:
        print("Attempting to parse as JSON and write the output")
    f.write(json.dumps(dictionary, sort_keys=True))
    if verbose_debug:
        print("Successfully wrote file:", str(filename))
    f.close


# Custom Exception Classes
class RowProcessingError(Exception):
    """Exception to be raised when there is an issue processing a row
    Could be caused by invalid HTML, an unexpected element, etc.
    """
    def __init__(self, msg, tr):
        self.msg = msg
        self.tr = tr
    def __str__(self):
        return repr(self.msg)+"\n Passed tr was: "+repr(self.tr)


# And now that everything is defined, actually run the program!
if __name__=="__main__":
   main()
