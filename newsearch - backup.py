from flask import Flask, request, jsonify
import os
import json
import re
# import pymongo
import pyodbc
from datetime import datetime
from flask_cors import CORS
import requests
from datetime import datetime
import xml.etree.ElementTree as ET

app = Flask(__name__)
CORS(app)

# Define a list of terms to exclude
exclude_terms = [
    "first floor", "ground floor", "second floor", "third floor",
    "ff", "sf", "tf", "gf", "g/f", "f/f", "s/f", "t/f", "no", "number"
]

## BACKSIDE ,FRONTSIDE, UPPER,LOWER

# Define a list of terms to concatenate with the next number
concatenate_terms = [
    "HOUSE", "PLOT", "SECTOR", "KHASRA", "GALI", "STREET", "JHUGGI", "POCKET", "KHOLI", "SHOP"
]

# SOLR CONNECTION : 
solr_url = 'http://localhost:5000/solr/AUTOCFNEW/select'

# Oracle database configuration
oracle_dsn = 'EBSDEV'
oracle_username = 'MOBAPP'
oracle_password = 'MOBAPP'

# Predefined Oracle query
oracle_query = """
SELECT AUFNR, REQUEST_NO, BUKRS, VAPLZ, NAME_FIRST||' '||NAME_LAST AS NAME, TEL_NUMBER, E_MAIL, ILART,
HOUSE_NUM1||' '||STR_SUPPL1||' '||STREET||' '||STR_SUPPL2 AS SAP_ADDRESS
FROM MOBAPP.SAP_SEVAKENDRA_SEARCH FETCH FIRST 10 ROWS ONLY
"""
# ADD WHERE CONDITION FOR FLAG = UNPROCESSED

# Function to connect to the Oracle database
def connect_to_oracle():
    return pyodbc.connect(
        'DSN=' + oracle_dsn + ';UID=' + oracle_username + ';PWD=' + oracle_password,
        autocommit=True
    )

# Predefined Oracle query to fetch divisions
divisions_query = """
SELECT DISTINCT(VAPLZ)
FROM MOBAPP.SAP_SEVAKENDRA_SEARCH
ORDER BY VAPLZ ASC
"""

# API endpoint to fetch divisions on page load
@app.route('/divisions_on_page_load', methods=['GET'])
def fetch_divisions_on_page_load():
    try:
        # Connect to the Oracle database
        connection = connect_to_oracle()
        cursor = connection.cursor()

        # Execute the Oracle query to fetch distinct divisions
        cursor.execute(divisions_query)

        # Fetch all distinct divisions from the query result
        divisions = [row[0] for row in cursor.fetchall()]

        # Close the database connection
        cursor.close()
        connection.close()

        return jsonify({"divisions": divisions})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Updated insert_into_autocf_output_master function to insert data into AUTOCF_OUTPUT_MASTER table
def insert_into_autocf_output_master(request_data, search_results):
    try:
        connection = connect_to_oracle()
        cursor = connection.cursor()

        # Extract values from the request data
        aufnr = request_data.get('AUFNR', '')
        request_no = request_data.get('REQUEST_NO', '')
        bukrs = request_data.get('BUKRS', '')
        vaplz = request_data.get('VAPLZ', '')
        name = request_data.get('NAME', '')
        tel_number = request_data.get('TEL_NUMBER', '')
        e_mail = request_data.get('E_MAIL', '')
        ilart = request_data.get('ILART', '')
        sap_address = request_data.get('SAP_ADDRESS', '')

        for entry in search_results:
            # Extract values from the Solr results
            cons_ref = entry.get('CONS_REF', [None])[0]
            sap_name = entry.get('SAP_NAME', [''])[0]
            sap_division = entry.get('SAP_DIVISION', [''])[0]
            sap_department = entry.get('SAP_DEPARTMENT', [''])[0]
            sap_company = entry.get('SAP_COMPANY', [''])[0]
            sap_address_result = entry.get('SAP_ADDRESS', [''])[0]
            father_name = entry.get('FATHER_NAME', [''])[0]
            sap_pole_id = entry.get('SAP_POLE_ID', [''])[0]
            csts_cd = entry.get('CSTS_CD', [''])[0]
            mobile_no = entry.get('MOBILE_NO', [''])[0]
            tariff = entry.get('TARIFF', [''])[0]

            # Here we need to add insertion logic of adding 4 additional column data - MRU,SEQUENCE_NO,LEGAL_FLAG,METER_NO,DISPATCH_CONTROL

            # Insert data into the AUTOCF_OUTPUT_MASTER table
            cursor.execute("""
                INSERT INTO AUTOCF_OUTPUT_MASTER (
                    AUFNR, REQUEST_NO, BUKRS, VAPLZ, NAME, TEL_NUMBER, E_MAIL, ILART, SAP_ADDRESS,
                    OUTPUT_SAP_DIVISION, OUTPUT_SAP_DEPARTMENT, OUTPUT_SAP_COMPANY, OUTPUT_CONS_REF, 
                    OUTPUT_SAP_NAME, OUTPUT_SAP_ADDRESS, OUTPUT_FATHER_NAME, OUTPUT_SAP_POLE_ID, 
                    OUTPUT_CSTS_CD, OUTPUT_MOBILE_NO, OUTPUT_TARIFF, OUTPUT_COMBINED_ADDRESS
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                aufnr, request_no, bukrs, vaplz, name, tel_number, e_mail, ilart, sap_address,
                sap_division, sap_department, sap_company, cons_ref, sap_name, sap_address_result, father_name,
                sap_pole_id, csts_cd, mobile_no, tariff, sap_address_result
            ))

        connection.commit()
        cursor.close()
        connection.close()

    except Exception as e:
        return str(e)


@app.route('/fetch_cases', methods=['GET'])
def fetch_cases():
    try:
        # Get the selected division from the frontend (replace 'selected_division' with the actual variable)
        selected_division = request.args.get('selected_division')

        # Validate that 'selected_division' is not empty or None
        if selected_division is None or not selected_division.strip():
            return jsonify({"error": "Selected division is missing or empty."}), 400

        # Construct the Oracle query with the WHERE condition for the selected division
        oracle_query = f"""
        SELECT AUFNR, REQUEST_NO, BUKRS, VAPLZ, NAME_FIRST||' '||NAME_LAST AS NAME, 
        TEL_NUMBER, E_MAIL, ILART, HOUSE_NUM1||' '||STR_SUPPL1||' '||STREET||' '||STR_SUPPL2 AS SAP_ADDRESS
        FROM MOBAPP.SAP_SEVAKENDRA_SEARCH
        WHERE VAPLZ=?
        """

        # Connect to the Oracle database
        connection = pyodbc.connect(
            'DSN=' + oracle_dsn + ';UID=' + oracle_username + ';PWD=' + oracle_password,
            autocommit=True
        )
        cursor = connection.cursor()

        # Execute the Oracle query with the selected division as a parameter
        cursor.execute(oracle_query, selected_division)

        # Fetch all rows from the query result
        columns = [column[0] for column in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Close the database connection
        cursor.close()
        connection.close()

        # Get the current date and time
        current_datetime = datetime.now()

        # Format the date and time as per the required format
        formatted_datetime = current_datetime.strftime("%d-%m-%Y_%H-%M-%S")  # Replaced ":" with "_"

        # Define the filename for the JSON file
        json_filename = f'ORACLE_{formatted_datetime}.json'

        # Save the Oracle query results in a JSON file
        with open(json_filename, 'w') as json_file:
            json.dump(rows, json_file)

        return jsonify({"message": "Cases fetched successfully.", "data": rows})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Updated /auto_search API using the connect_to_oracle function
@app.route('/auto_search', methods=['GET'])
def auto_search():
    # Create a timestamp for the current time
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')

    try:
        # Connect to the Oracle database
        connection = connect_to_oracle()
        cursor = connection.cursor()

        # Execute the Oracle query
        cursor.execute(oracle_query)

        # Fetch the cursor description
        cursor_description = [column[0] for column in cursor.description]

        # Fetch all rows from the query result
        oracle_results = cursor.fetchall()
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        connection.close()

    # Save the Oracle query results in a JSON file with the timestamp
    oracle_results_filename = f'oracle_results_{timestamp}.json'
    with open(oracle_results_filename, 'w') as json_file:
        json.dump([dict(zip(cursor_description, row)) for row in oracle_results], json_file)

    # Initialize a list to store results
    final_results = []

    # Process each row from the Oracle results
    for row in oracle_results:
        # Convert the entire row to a dictionary
        row_data = dict(zip(cursor_description, row))

        # Perform a search using the existing /search API by passing the entire row as the request data
        search_response = search_address(row_data)

        # Append the search results to the final_results list
        final_results.append({"search_query": row_data, "search_results": search_response})

    # Save the final_results in a JSON file with the timestamp
    final_results_filename = f'final_results_{timestamp}.json'
    with open(final_results_filename, 'w') as json_file:
        json.dump(final_results, json_file)

    return jsonify({"message": "Auto search completed successfully.", "results_file": final_results_filename})

# Modify the search_address function to accept the entire row as request data
def search_address(request_data):
    response = app.test_client().post('/search', json=request_data)
    return json.loads(response.get_data(as_text=True))

# Updated /search API to accept complete request data
@app.route('/search', methods=['POST'])
def search():
    try:
        # Get the complete request data from the request
        data = request.get_json()

        # # Extract SAP_ADDRESS from the request data
        sap_address = data.get('SAP_ADDRESS', '')

        # Step 2: Remove the exclude terms from the SAP_ADDRESS
        for term in exclude_terms:
            sap_address = re.sub(rf'\b{term}\b', '', sap_address, flags=re.IGNORECASE)

        # Step 3: Remove special characters and add spaces
        sap_address = re.sub(r'[^\w\s]', '', sap_address)
        sap_address = ' '.join(sap_address.split())

        # Split the processed SAP_ADDRESS into individual words
        search_words = sap_address.split()

        # Get the current date and time for timestamp
        timestamp = datetime.now().strftime('%Y%m%d%H%M%S')

        # Create a folder with the format SEARCH_RESULTS_(Date Time Stamp)
        results_folder_name = f'SEARCH_RESULTS_{timestamp}'
        os.makedirs(results_folder_name, exist_ok=True)

        # Initialize a list to keep track of filtered results
        filtered_results = []

        # Initialize a flag to check if a word was skipped
        word_skipped = False

        # Initialize the maximum number of filtering rounds
        max_filtering_rounds = 10  # You can adjust this as needed

        # Set a threshold for the number of results that triggers additional rounds
        result_threshold = 100

        # Function to split words separated by special characters
        def split_special_chars(word):
            # Split the word using special characters as delimiters
            parts = re.split(r'[-/]', word)
            # Remove empty parts and strip whitespace
            parts = [part.strip() for part in parts if part.strip()]
            return parts

        # Step 4: Find the word with the longest length
        longest_word = max(search_words, key=len)

        # Construct a Solr query based on the longest_word and any other filtering criteria
        solr_query = f'q=COMBINED_ADDRESS:*{longest_word}*'
        solr_query += '&rows=1000000'  # Rows parameter to fetch a large number of results

        # Fetch data from the Solr core using the Solr /select API
        try:
            response = requests.get(solr_url, params=solr_query)
            if response.status_code == 200:
                results_data = response.json().get('response', {}).get('docs', [])
            else:
                return jsonify({"error": "Failed to fetch data from Solr."}), 500
        except Exception as e:
            return jsonify({"error": str(e)}), 500

        # Create a subfolder for the search query inside the results folder
        subfolder_name = os.path.join(results_folder_name, sap_address.replace(" ", "_"))
        os.makedirs(subfolder_name, exist_ok=True)

        # Step 6: Store the results in ROUND1.json within the user's subfolder
        round1_filename = os.path.join(subfolder_name, 'ROUND1.json')
        with open(round1_filename, 'w') as json_file:
            json.dump(results_data, json_file, default=str)  # Use default=str to handle serialization

        # Check if there are fewer than 10 results in the first round
        if len(results_data) < 10:
            word_skipped = True
        else:
            # Initialize a list to keep track of filtered results
            filtered_results = results_data

        # Continue with dynamic filtering as long as the number of results exceeds the threshold
        round_counter = 0
        while len(filtered_results) > result_threshold and round_counter < max_filtering_rounds:
            round_counter += 1

            # Find the next longest word
            search_words.remove(longest_word)
            longest_word = max(search_words, key=len)

            # Split the word if it contains special characters
            longest_word_parts = split_special_chars(longest_word)

            # Initialize a list to store filtered results for the current word
            current_word_filtered_results = []

            # Filter the Solr results based on the current longest word parts
            for doc in filtered_results:
                combined_address = doc.get('COMBINED_ADDRESS', [''])[0].lower()  # Get the first element and convert to lowercase
                if any(part.lower() in combined_address for part in longest_word_parts):
                    current_word_filtered_results.append(doc)

            # Update filtered_results with the results for the current word
            filtered_results = current_word_filtered_results

        # Step 9: Store the final filtered results in a JSON file within the user's subfolder
        final_results_filename = os.path.join(subfolder_name, 'FINAL_RESULTS.json')
        with open(final_results_filename, 'w') as json_file:
            json.dump({"request_details": data, "search_results": filtered_results}, json_file, default=str)  # Include request details

        # Insert the filtered results into the AUTOCF_OUTPUT_MASTER table
        insert_error = insert_into_autocf_output_master(data, filtered_results)
        # insert_error = insert_into_autocf_output_master(row, filtered_results)
        if insert_error:
            return jsonify({"error": insert_error}), 500

        response = {
            "search_query": sap_address,
            "results_count": len(filtered_results),
            "results_folder": results_folder_name
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# API to write search request data to a JSON file
@app.route('/write_search_request', methods=['POST'])
def write_search_request():
    try:
        # Get the selected rows' data from the request
        data = request.get_json()
        selected_rows = data.get('selectedRows', [])

        if not selected_rows:
            return jsonify({"error": "No selected rows data provided."}), 400

        # Get the current date and time
        current_datetime = datetime.now()

        # Format the date and time as per the required format
        formatted_datetime = current_datetime.strftime("%Y%m%d%H%M%S")  # Replaced ":" with "_"

        # Define the filename for the JSON file
        json_filename = f'Search_Request_{formatted_datetime}.json'

        # Save the selected rows' data in a JSON file
        with open(json_filename, 'w') as json_file:
            json.dump(selected_rows, json_file, default=str)  # Use default=str to handle serialization

        return jsonify({"message": "Search request data written successfully.", "filename": json_filename})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Specify the directory where the search request data JSON files are stored
search_request_directory = 'E:/TESTCF/backend'  # Update with the appropriate directory path

# API to retrieve the latest search request data JSON file
@app.route('/get_latest_search_request', methods=['GET'])
def get_latest_search_request():
    try:
        # List all files in the directory
        all_files = os.listdir(search_request_directory)

        # Filter JSON files only
        json_files = [f for f in all_files if f.endswith('.json')]

        if not json_files:
            return jsonify({"error": "No search request data files found."}), 404

        # Sort JSON files by modification time (newest first)
        json_files.sort(key=lambda x: os.path.getmtime(os.path.join(search_request_directory, x)), reverse=True)

        # Get the filename of the latest JSON file
        latest_filename = json_files[0]

        # Define the path to the latest search request data JSON file
        json_file_path = os.path.join(search_request_directory, latest_filename)

        # Read and parse the JSON data from the file
        with open(json_file_path, 'r') as json_file:
            search_request_data = json.load(json_file)
        return jsonify(search_request_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# New API endpoint to retrieve search results as JSON
@app.route('/get_results/<folder_name>', methods=['GET'])
def get_results(folder_name):
    # Define the path to the FINAL_RESULTS.json file
    results_file_path = os.path.join(folder_name, 'FINAL_RESULTS.json')

    # Check if the file exists
    if not os.path.exists(results_file_path):
        return jsonify({"error": "Results not found."}), 404

    # Read and parse the JSON data from the file
    try:
        with open(results_file_path, 'r') as json_file:
            results_data = json.load(json_file)
        return jsonify(results_data)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get_autocf_output_data', methods=['GET'])
def get_autocf_output_data():
    try:
        # Connect to the Oracle database
        connection = connect_to_oracle()
        cursor = connection.cursor()

        # Define a query to fetch data from AUTOCF_OUTPUT_MASTER
        query = """
            SELECT *
            FROM AUTOCF_OUTPUT_MASTER
        """
        
        # Execute the query
        cursor.execute(query)

        # Fetch all rows from the query result
        columns = [column[0] for column in cursor.description]
        rows = [dict(zip(columns, row)) for row in cursor.fetchall()]

        # Close the database connection
        cursor.close()
        connection.close()

        return jsonify({"data": rows})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/fetch_request_cases', methods=['GET'])
def fetch_request_cases():
    try:
        # Connect to the Oracle database and fetch results
        connection = connect_to_oracle()
        cursor = connection.cursor()

        # Execute the Oracle query to fetch request cases
        cursor.execute("SELECT DISTINCT AUFNR, REQUEST_NO, BUKRS, VAPLZ, NAME, TEL_NUMBER, E_MAIL, ILART, SAP_ADDRESS FROM MOBAPP.AUTOCF_OUTPUT_MASTER")
        
        # Fetch the cursor description
        cursor_description = [column[0] for column in cursor.description]

        # Fetch all rows from the query result
        request_data = [dict(zip(cursor_description, row)) for row in cursor.fetchall()]

        cursor.close()
        connection.close()

        return jsonify({"data": request_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/fetch_search_matches', methods=['GET'])
def fetch_search_matches():
    try:
        # Get the AUFNR parameter from the request
        aufnr = request.args.get('aufnr')

        if not aufnr:
            return jsonify({"error": "AUFNR parameter is required."}), 400

        # Connect to the Oracle database and fetch results
        connection = connect_to_oracle()
        cursor = connection.cursor()

        # Execute the Oracle query to fetch search matches based on AUFNR
        cursor.execute("""
            SELECT OUTPUT_SAP_DIVISION,OUTPUT_SAP_DEPARTMENT,
                   OUTPUT_SAP_COMPANY,OUTPUT_CONS_REF,OUTPUT_SAP_NAME,
                   OUTPUT_SAP_ADDRESS,OUTPUT_FATHER_NAME,
                   OUTPUT_SAP_POLE_ID,OUTPUT_CSTS_CD,OUTPUT_MOBILE_NO,
                   OUTPUT_TARIFF FROM MOBAPP.AUTOCF_OUTPUT_MASTER
            WHERE AUFNR=?
        """, (aufnr,))

        # Fetch the cursor description
        cursor_description = [column[0] for column in cursor.description]

        # Fetch all rows from the query result
        search_results_data = [dict(zip(cursor_description, row)) for row in cursor.fetchall()]

        cursor.close()
        connection.close()

        return jsonify({"data": search_results_data})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Define a route for getting the count
@app.route('/get_request_count', methods=['GET'])
def get_request_count():
    try:
        # Establish a connection to the Oracle database
        connection = pyodbc.connect(f'DSN={oracle_dsn};UID={oracle_username};PWD={oracle_password}')

        # Create a cursor
        cursor = connection.cursor()

        # Define the SQL query to count distinct REQUEST_NO
        sql_query = "SELECT COUNT(DISTINCT(REQUEST_NO)) FROM AUTOCF_OUTPUT_MASTER"

        # Execute the query
        cursor.execute(sql_query)

        # Fetch the result
        count = cursor.fetchone()[0]

        # Close the cursor and the database connection
        cursor.close()
        connection.close()

        # Return the count as JSON response
        response = {"count": count}
        return jsonify(response)

    except Exception as e:
        # Handle any exceptions that occur during database operations
        return jsonify({"error": str(e)}), 500

@app.route('/fetch_search_results', methods=['GET'])
def fetch_search_results():
    try:
        # Establish a connection to the Oracle database
        connection = pyodbc.connect(f'DSN={oracle_dsn};UID={oracle_username};PWD={oracle_password}')

        # Get the selected REQUEST_NO from the request query parameters
        request_no = request.args.get('aufnr')

        # Prepare and execute the SQL query to get the count of search results
        cursor = connection.cursor()
        query = f"SELECT COUNT(*) FROM MOBAPP.AUTOCF_OUTPUT_MASTER WHERE AUFNR = ?"
        cursor.execute(query, (request_no,))
        count = cursor.fetchone()[0]

        # Close the database connection
        connection.close()

        # Return the count as JSON response
        return jsonify({"count": count})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Function to update DUES in the database for a CA number
def update_dues_in_database(ca_number, amount):
    try:
        connection = connect_to_oracle()
        cursor = connection.cursor()

        # Update DUES column in the AUTOCF_OUTPUT_MASTER table
        cursor.execute("UPDATE MOBAPP.AUTOCF_OUTPUT_MASTER SET DUES = ? WHERE OUTPUT_CONS_REF = ?", (amount, ca_number))
        connection.commit()

        cursor.close()
        connection.close()
    except Exception as e:
        return str(e)

@app.route('/calculate_dues', methods=['POST'])
def calculate_dues():
    try:
        # Get CA numbers from the request
        data = request.get_json()
        ca_numbers = data.get('caNumbers', [])

        # Initialize a list to store dues data
        dues_data = []

        for ca_number in ca_numbers:
            # Construct the SOAP request XML
            soap_request = """<?xml version="1.0" encoding="utf-8"?>
            <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
              <soap:Body>
                <ZBAPI_CA_OUTSTANDING_AMT xmlns="http://tempuri.org/">
                  <strCANumber>{}</strCANumber>
                </ZBAPI_CA_OUTSTANDING_AMT>
              </soap:Body>
            </soap:Envelope>""".format(ca_number)

            # Make a POST request to the external SOAP API
            response = requests.post(
                'https://bsesapps.bsesdelhi.com/DelhiV2/ISUService.asmx?op=ZBAPI_CA_OUTSTANDING_AMT',
                headers={'Content-Type': 'text/xml'},
                data=soap_request
            )

            # Parse the SOAP response
            root = ET.fromstring(response.content)
            ca = None
            name = None
            amount = None
            flag = None

            for element in root.iter():
                if element.tag == 'E_O_CA':
                    ca = element.text
                elif element.tag == 'E_O_NAME':
                    name = element.text
                elif element.tag == 'E_O_AMT':
                    amount = element.text
                elif element.tag == 'E_O_FLAG':
                    flag = element.text

            # Update DUES column in the database for the corresponding CA number
            update_error = update_dues_in_database(ca_number, amount)

            if update_error:
                return jsonify({'error': update_error}), 500

            # Add the data to the dues_data list
            dues_data.append({
                'CA_NUMBER': ca,
                'NAME': name,
                'AMOUNT': amount,
                'FLAG': flag
            })

        return jsonify({'duesData': dues_data})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
   
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)