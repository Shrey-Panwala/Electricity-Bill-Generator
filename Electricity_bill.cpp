#include <bits/stdc++.h>
using namespace std;

// Structure to store consumer details
struct Consumer {
    int consumerID;
    string name;
    string address;
    string mobile_no;
    Consumer* next;  // Pointer to next consumer
};

// Structure to store bill details
struct Bill {
    int consumerID;
    int month;
    int year;
    int units_consumed;
    double amt;
    Bill* next;  // Pointer to next bill
};

double cost_per_unit = 5.0;

// Head pointers for linked lists
Consumer* consumer_head = nullptr;
Bill* bill_head = nullptr;

// Function to validate mobile number
bool valid_num(const string& mobile_no) {
    if (mobile_no.length() != 10) {
        return false;
    }
    for (char c : mobile_no) {
        if (!isdigit(c)) {
            return false;
        }
    }
    return true;
}

// Function to validate year
bool valid_year(int year) {
    return year >= 2000 && year <= 2026;
}

// Function to validate month
bool valid_month(int month) {
    return month >= 1 && month <= 12;
}

// Function to validate address
bool valid_address(const string& address) {
    return !address.empty() && address.length() >= 7;
}

// Function to check if a consumer already exists
bool exist_consumer(int consumerID) {
    Consumer* current = consumer_head;
    while (current != nullptr) {
        if (current->consumerID == consumerID) {
            return true;
        }
        current = current->next;
    }
    return false;
}

// Function to check if a bill for a consumer exists for a given month and year
bool exist_bill(int consumerID, int month, int year) {
    Bill* current = bill_head;
    while (current != nullptr) {
        if (current->consumerID == consumerID && current->month == month && current->year == year) {
            return true;
        }
        current = current->next;
    }
    return false;
}

// Function to add a new consumer to the linked list
void add_consumer(int consumerID, string name, string address, string mobile_no) {
    // Check if consumer already exists
    if (exist_consumer(consumerID)) {
        cout << "Consumer already exists." << endl;
        return;
    }

    Consumer* new_consumer = new Consumer{consumerID, name, address, mobile_no, nullptr};
    if (consumer_head == nullptr) {
        consumer_head = new_consumer;
    } else {
        Consumer* current = consumer_head;
        while (current->next != nullptr) {
            current = current->next;
        }
        current->next = new_consumer;
    }

    cout << "Consumer successfully added." << endl;
}

// Function to add a new bill to the linked list
void add_bill(int consumerID, int month, int year, int units_consumed) {
    // Check if bill already exists
    if (exist_bill(consumerID, month, year)) {
        cout << "Bill already exists for the given month and year." << endl;
        return;
    }

    double amt = units_consumed * cost_per_unit;
    Bill* new_bill = new Bill{consumerID, month, year, units_consumed, amt, nullptr};

    if (bill_head == nullptr) {
        bill_head = new_bill;
    } else {
        Bill* current = bill_head;
        while (current->next != nullptr) {
            current = current->next;
        }
        current->next = new_bill;
    }

    cout << "Bill added successfully." << endl;
}

// Function to generate and display the bill for a specific consumer
void generate_bill(int consumerID, int month, int year) {
    Consumer* current_consumer = consumer_head;
    while (current_consumer != nullptr && current_consumer->consumerID != consumerID) {
        current_consumer = current_consumer->next;
    }

    if (current_consumer == nullptr) {
        cout << "Consumer not found." << endl;
        return;
    }

    Bill* current_bill = bill_head;
    while (current_bill != nullptr) {
        if (current_bill->consumerID == consumerID && current_bill->month == month && current_bill->year == year) {
            break;
        }
        current_bill = current_bill->next;
    }

    if (current_bill == nullptr) {
        cout << "No bill found for the given month and year." << endl;
        return;
    }

    // Display bill details for the requested month and year
    cout << fixed << setprecision(2);
    cout << "\nBill for " << month << "/" << year << " for consumer " << consumerID << ":\n";
    cout << "------------------------------------------\n";
    cout << "| Consumer Name   | " << setw(20) << left << current_consumer->name << " |" << endl;
    cout << "| Address         | " << setw(20) << left << current_consumer->address << " |" << endl;
    cout << "| Mobile Number   | " << setw(20) << left << current_consumer->mobile_no << " |" << endl;
    cout << "| Units Consumed  | " << setw(20) << left << current_bill->units_consumed << " |" << endl;
    cout << "| Amount Due      | " << setw(20) << left << current_bill->amt << " |" << endl;
    cout << "------------------------------------------\n";

    // Collect past bills for reference
    vector<Bill> past_bills;
    Bill* temp_bill = bill_head;
    while (temp_bill != nullptr) {
        if (temp_bill->consumerID == consumerID && (temp_bill->year < year || (temp_bill->year == year && temp_bill->month < month))) {
            past_bills.push_back(*temp_bill);
        }
        temp_bill = temp_bill->next;
    }

    // Sort past bills to show the last three months
    sort(past_bills.begin(), past_bills.end(), [](const Bill& a, const Bill& b) {
        return (a.year != b.year) ? (a.year > b.year) : (a.month > b.month);
    });

    // Get the last 3 bills (or fewer if there are less than 3)
    vector<Bill> last_three_months;
    int counter = 0;
    for (const auto& bill : past_bills) {
        if (counter < 3) {
            last_three_months.push_back(bill);
            counter++;
        }
    }

    // If there are fewer than 3 past bills, only display the available ones
    if (!last_three_months.empty()) {
        cout << "\nPrevious Bills:\n";
        for (const auto& bill : last_three_months) {
            cout << "  Month: " << bill.month << "/" << bill.year << " - Amount: " << bill.amt << endl;
        }
        cout << "----------------------------" << endl;
    } else {
        cout << "\nNo complete bill details for the last 3 consecutive months." << endl;
    }
}

// Function to display all consumers in increasing order of consumerID
void display_consumer() {
    if (consumer_head == nullptr) {
        cout << "No consumer records found." << endl;
        return;
    }

    // Collect consumers in an array
    Consumer* current = consumer_head;
    vector<Consumer> consumers;
    while (current != nullptr) {
        consumers.push_back(*current);
        current = current->next;
    }

    // Sort consumers by consumerID
    sort(consumers.begin(), consumers.end(), [](const Consumer& a, const Consumer& b) {
        return a.consumerID < b.consumerID;
    });

    // Display the consumers in a table format
    cout << "\nList of Consumers:\n";
    cout << "-------------------------------------------------------------\n";
    cout << "| Consumer ID  | Name         | Address      | Mobile No.   |\n";
    cout << "-------------------------------------------------------------\n";
    for (const auto& c : consumers) {
        cout << "| " << setw(12) << left << c.consumerID << " | "
             << setw(12) << left << c.name << " | "
             << setw(12) << left << c.address << " | "
             << setw(12) << left << c.mobile_no << " |\n";
    }
    cout << "-------------------------------------------------------------\n";
}

bool getValidIntInput(int &input) {
    cin >> input;
    while (cin.fail()) {
        cin.clear(); // Clear the error flag on cin
        cin.ignore(numeric_limits<streamsize>::max(), '\n'); // Discard invalid input
        cout << "Invalid input. Please enter an integer: ";
        cin >> input;
    }
    return true;
}

// Main function to interact with the user
int main() {
    int choice;
    while (true) {

        cout << "Menu:"<<endl;
        cout << "1. To Add Consumer"<<endl;
        cout << "2. To Display all Consumers"<<endl;
        cout << "3. To Add Bill"<<endl;
        cout << "4. To Generate Bill of particular consumer"<<endl;
        cout << "5. Exit"<<endl;
        cout << "Enter your choice: ";
        
        getValidIntInput(choice);

        switch (choice) {
            case 1: {
                int consumerID;
                string name, address, mobileNo;
                cout << "Enter consumer ID: ";
                cin >> consumerID;
                if (exist_consumer(consumerID)) {
                    cout << "Consumer already exists." << endl ;
                }
                else{
                cin.ignore();
                cout << "Enter consumer's name: ";
                getline(cin, name);
                cout << "Enter consumer's address: ";
                getline(cin, address);
                if (!valid_address(address)) {
                    cout << "Invalid address." << endl ;
                    cout << "Enter consumer's address:" << endl;
                    getline(cin, address);
                }
                cout << "Enter consumer's mobile number: ";
                getline(cin, mobileNo);
                if (!valid_num(mobileNo)) {
                    cout << "Invalid mobile no." << endl ;
                    cout << "Enter consumer's mobile number: ";
                    getline(cin, mobileNo);
                }
                add_consumer(consumerID, name, address, mobileNo);
                }
                break;
            }
            case 2:
                display_consumer();
                break;
            case 3: {
                int consumerID, month, year, unitsConsumed;
                cout << "Enter consumer ID: ";
                cin >> consumerID;
                if (!exist_consumer(consumerID)) {
                    cout << "Consumer not found." << endl ;
                }
                else{
                cout << "Enter month: ";
                cin >> month;
                if (!valid_month(month)) {
                    cout << "Invalid month." << endl ;    
                    cout << "Enter month: ";
                    cin >> month;
                }
                cout << "Enter year: ";
                cin >> year;
                if (!valid_year(year)) {
                    cout << "Invalid year." << endl ;
                    cout << "Enter year: ";
                    cin >> year;
                }
                cout << "Enter total units consumed: ";
                cin >> unitsConsumed;
                add_bill(consumerID, month, year, unitsConsumed);
                }
                break;
            }
            case 4: {
                int consumerID, month, year;
                cout << "Enter consumer ID: ";
                cin >> consumerID;
                if (!exist_consumer(consumerID)) {
                    cout << "Consumer not found." << endl ;
                }
                else{
                cout << "Enter month: ";
                cin >> month;
                cout << "Enter year: ";
                cin >> year;
                generate_bill(consumerID, month, year);
                }
                break;
            }
            case 5:
                cout << "Exiting the program....." << endl;
                return 0;
            default:
                cout <<"Choose option between 1-5."<< endl;
        }
    }
}
