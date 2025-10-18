**Project Overview:** 

Auto Inventory is a modular web-based platform designed to streamline vehicle inventory management, sales, and purchases. It supports three distinct user roles Admin, Seller, and Transporter and each with tailored access and functionality.

2\. **User Roles & Responsibilities**

**Admin can oversee the platform and manage the whole inventory system.** 

**Capabilities**:

* View, manage, and moderate all users (Transporter & Sellers)  
* Access full inventory across all sellers  
* Monitor sales, purchases, and auction performance  
* Approve or suspend seller accounts  
* Export reports and analytics  
* Configure platform settings and permissions  
* Manage auctions, listings, and system-wide notifications

**Seller \- \> Vendor managing vehicle listings and transactions**

**Capabilities**:

* Register and maintain seller profile  
* Add, edit, and remove vehicle listings  
* View and manage inquiries, orders, and earnings  
* Participate in auctions (if applicable)  
* Access seller dashboard with performance metrics

**Transporter**

* **Primary Role**: Customer browsing and purchasing vehicles

**Capabilities**:

* Register and maintain **Transporter** profile  
* Browse inventory and search/filter listings  
* Save favorites and initiate purchases or inquiries  
* View order history and messages  
* Access **Transporter** dashboard with personalized content

3\. **Authentication & Role Assignment**

* **Registration Flow**:  
  * Users select role (**Transporter** or Seller) during sign-up  
  * Admin accounts are created manually via Admin Panel  
* **Login Flow**:  
  * Role-based redirection to respective dashboards

**Access Control**:

* Role-based permissions enforced via backend RBAC  
* Unauthorized access attempts are blocked or redirected

4\. **Inventory Management Logic**

* Sellers manage their own inventory only  
* Admin has global visibility and control over all inventory  
* **Transporter** can view listings but cannot modify inventory

Inventory items include:

* Vehicle details (make, model, year, price, condition)  
* Auction status (if applicable)  
* ARB status and documentation  
* Seller contact and location info

**Admin Panel – Requirements**

1\. **Dashboard Overview**

The Admin Dashboard provides real-time visibility into platform performance, user activity, and auction metrics. It includes:

1. Key Metrics 

These key metrics will be in  form of cards that will display the data of : 

* **Total Sales**  
  * Value: $3,540,730.00  
  * Weekly Change: \+15.6%, \+1.6k  
* **Total Purchases**  
  * Value: $198,750.00  
  * Orders: 2  
  * Weekly Change: \+1.6k  
* **ARB Vehicles**  
* Count: 11  
* Weekly Change: \-15.6%, \-213

B. Sales Performance

* Line graph showing trends over time  
* Filterable by date (e.g., Today, Week, Month)  
* Exportable in CSV & Pdf

C. Top Auctions

* Pie chart displaying auction contributions:  
  * Adesa: $0  
  * CarMax: $33,150  
  * Default Auction: $0  
  * Manheim: $165,000  
* Total: $198,150  
* Color-coded for clarity

D. Calendar Integration

* Monthly calendar view (e.g., September 2025\)  
* Highlights current date  
* Potential for scheduling events, auctions, or reminders

When the Admin clicks on any date in the calendar view, a modal or overlay appears with the following scheduling interface:

* **Event Time** input (with clock picker)  
* **Select Predefined Event** dropdown  
* **Assign User** dropdown of all existing users  
* **SAVE** and **DISMISS** buttons


3\. Task Management (Todo List) – Module Requirements

This module allows Admins to track, assign, and manage vehicle-related tasks across users. It supports operational efficiency by organizing documentation, compliance, and follow-up actions.

2\. Dashboard Overview

Summary Panel

Displays real-time task counts by category. These insights counts will be displayed in 5 cards in a row. 

* Accounting To Do: 2  
* All Tasks   
* Missing Title   
* File an ARB   
* Location 

**Important :** A search bar will appear to search any details of any desired or required car from below table. Filters options will allow to select the date between start date and end date to filter the data among those selected dates. Filter reset button will help to reset all filters.There will be two other options/buttons of Import (allow users to import the data in csv format only) and Export in CSV AND PDF. 

**Task Table :** 

This will include columns including Task ID (Unique) 

* Associated vehicle (e.g., 2021 Chevrolet Silverado including VIN)  
* Assigned to \-\>User responsible (Admin or Seller)  
* Assigned Date \-\> A datepicker will be used to select the date   
* Countdown \-\> Time remaining until deadline  
* Category \-\> Dropdown with options like Missing Title , File an ARB , Location  
* Action column \-\>  3 dotted with option to mark as completed or View Details 

The table will have pagination also . 

**3\. Functional Capabilities**

**Trigger Behavior**

Admin clicks **“Add Task”** from the Todo List dashboard.A modal or form appears with the following fields:

1. **Select Vehicle \- \>** Dropdown or search field to select a registered vehicle ( NISSAN \- ROGUE SPORT) mandatory  
2. **Task Name \-\>** Free-text input for naming the task (e.g., “Upload Title Document”)mandatory  
3. **Due Date \-\>** Date picker with format `dd-mm-yyyy must be future date`  
4. **Notes \-\>** Optional field for additional context or instructions (Optional

**Submission Actions**

* **Submit** button:  
  * Validates all required fields  
  * Saves task to database  
  * Links task to selected vehicle and assigned user (default: Admin or manually assigned Seller or Transporter )  
  * Updates Todo List dashboard and countdown logic  
* **Dismiss/Cancel**:Closes modal without saving

4\. **Post-Creation Behavior**

* Task appears in the Todo List table with:  
  * Countdown timer based on due date  
  * Category auto-tagged if applicable (e.g., “Missing Title”)  
  * Status: “Pending”  
* Admin can later assign the task to a user via dropdown or task detail view

5\. **UI/UX Enhancements**

* Vehicle dropdown supports search by VIN or make/model  
* Date picker prevents past dates  
* Notes field supports multiline input  
* Confirmation toast or alert on successful task creation

**Inventory Module Requirements**

The inventory module will be divided into two parts: All and Buyer Withdrew. Both will be shown in the Inventory Section in the sidebar. The Layout of the page should be responsive. There shouldn't be any overlapping of content .Column headers must remain visible and aligned.

**1\. Header Counters**

Display the count of below mentioned in form of cards or any better solution at top of page:

* **Total number of cars in inventory**  
* **Number of cars with absent titles**  
* **Number of missing cars**

**2\. Inventory Table** 

**Inventory table includes different columns with search option , Import , Export , Filter and Add new Inventory button.**

**Table Columns**

* Vehicle  
* Purchase Date  
* Status   
* OdMeter  
* Car Location (Dropdown with different options Missing , Auction , Shop , Mechanic, others)  
* Bought Price   
* Title Status (Dropdown including Absent , Released, Received , Present etc)  
* Action column (3 dotted with options View details , edit vehicle , Mark as sold, download)  
* Checkbox (On selecting a checkbox , another dropdown should be appear with option of sold , withdrew , pending , In progress , Update status , Update car location)

**Functional Elements**

* Add Entry button  
* Export Data button  
* Import Data button  
* Filter and Filter Reset options  
* Pagination

**Data Behavior**

* Status column includes “In progress” and must support additional options via settings  
* Right-click on any cell opens Edit option  
* Timeline must not repeat events  
* Add “PDR” to car location dropdown (we should be able to add and make changes to these drop-down in setting)  
* Be able to export from certain dates not just this month and this week  
* Ability to export the filtered list  
* The filter option should match the cells of the list. For example car location should have all the dropdown options to filter from.

**Add New Inventory Form :** 

1. **When clicking on the add new inventory button , a form should be appeared with below mentioned fields.**

| Field | Type | Validation/Notes |
| :---- | :---- | :---- |
| Make | Text input | Required |
| Model | Text input | Required |
| Year | Text input | Must be numeric and valid year |
| Purchase Date | Date picker | Format: `dd-mm-yyyy`; must be a past or current date  |
| Status | Dropdown | Options include: Pending, Sold, Withdraw, Complete, ARB, etc. (editable via Settings) |
| Pickup Location | Dropdown | Options include: Shop/Mechanic, Auction, Other Mechanic, Unknown, Other, Missing, PDR (editable via Settings) |
| Odometer | Numeric input | Optional |
| Bought Price | Numeric input | Optional |
| VIN No | Text input | Must follow VIN format; capped at 10 digits |
| Title Status | Dropdown | Options: Absent, Present, etc. |
| ARB Status | Dropdown | Options: Absent, Present, etc. |

**2\. Submission Behavior**

Add Vehicle button:

* Validates all required fields  
* Saves vehicle to inventory database  
* Triggers ARB countdown logic (7 days from purchase date)  
* Vehicle appears in Inventory – All view immediately

3\. **Post-Submission Logic**

If **Title Status** or **Pickup Location** is missing:

* Cell is highlighted in **red**  
* VIN must be validated and truncated if over 10 digits  
* Model and Year must populate correct columns  
* Status must reflect selected dropdown value  
* ARB countdown begins and updates daily  
* Vehicle is searchable and editable from inventory list  
* The arb that appears here is different to the ARB tab (previously known as pending). The ARB in inventory is cars we ARB the ARB tab is when we sell a car and the buyer ARBs (arb is when there is a problem with the car). The arb countdown in inventory has to be 7 days from the purchase date this is amount of time we have to file for an arb once that countdown reaches the final day it should have a dropdown of arb submitted, no arb filled. There should be no BW history here. the BW link should only appear in the cars in the ARB tab or sold if there was a history of ARB.

## **View Vehicle Details – Inventory Table Interaction**

### **1\. Trigger**

* User clicks on the **ellipsis (`…`)** or designated **“View Details”** action in a row of the Inventory Table.  
* The system must open the **Details [Tab](http://Tab.It)**[.](http://Tab.It) It contains Tab Navigation with Details (Default tab) , Task tab , assessment tab , Parts & Expenses tab , Central Dispatch Tab and Timeline tab.  
* The Details Tab displays all vehicle-specific data in a structured format.

### **2\. Details Tab Contents**

| Section | Fields Displayed |
| :---- | ----- |
| **Vehicle Section** | Make, Model, Year, VIN, Purchase Date, Odometer, Bought Price, Location (Dropdown: Missing, Shop/Mechanic, Auction, Other Mechanic, Unknown, Other, PDR) |
| **Status Section** | Status, Title Status, ARB Status  Title Status (Dropdown: Absent, In Transit, Received, Available not Received, Present, Released, Validated, Sent but not Validated) ARB Status (Dropdown: Absent, Present, In Transit, Failed) BW History (Link only shown if vehicle is in ARB tab or marked Sold with ARB history) Exported (Status indicator with Download button to download the info) Upload button to upload title  |
| **Auction Section** | Select Auction (Dropdown: iaai, Manheim, CarMax, Adesa, Western, Default Auction) Auction Date Update button to Save auction details |

## **Additional Details – Vehicle Details Tab**

### **1\. Section Layout**

* Left side: **Image Upload**  
* Right side: **Notes Input**

### **2\. Image Upload Behavior**

| Element | Functionality |
| :---- | ----- |
| **Choose Files** | Allows selection of one or more image files |
| **File Status** | Displays “No file chosen” until a file is selected |
| **Upload Logic** | Files must be saved and linked to the vehicle record upon submission |

---

### **3\. Notes Section Behavior**

| Element | Functionality |
| :---- | ----- |
| **Text Box** | Labeled “Enter your notes here” |
| **Add Another Note** | Appends a new note field below the current one |
| **Save Notes** | Saves all entered notes to the vehicle record |
| **Note Status** | Displays “No notes available” if none exist |

### **4\. Validation & UI Behavior**

* Notes must be editable and persist after saving  
* Upload must support image formats (e.g., JPG, PNG)  
* Section must be responsive and not collapse on smaller screens

## **Tasks Tab – Vehicle-Level Task Management**

### **1\. Tab Location**

Appears in the top navigation bar of the vehicle view Including navigation tabs Details, Tasks, Assessment, Parts & Expenses, Central Dispatch, Timeline

### **2\. Tasks Table Structure**

| Column | Description |
| ----- | ----- |
| \# | Serial number of the task |
| Vehicle | Auto-filled with vehicle name (e.g., 2017 Ford Focus SE) |
| Task | Task name or description |
| Status | Dropdown: Pending, Completed, Cancelled, etc. (highlighted if pending) |
| Due | Due date (`dd-mm-yyyy`) |
| Assigned | Dropdown: Not Assigned, Transporter User, Staff, Momina, Afifa, Ayesha Masood, etc. |
| Assigned Date | Date when task was assigned |
| Notes | Free-text notes related to the task |
| Options | Dropdown: Edit, Delete, Mark as Sold |

### **3\. Task Actions**

#### **Add Task Opens modal with:**

* Task Name (text input)  
  * Due Date (date picker)  
  * Note (text input)  
  * Add Task button

#### **Download PDF  Buttons-\>** Exports current task list for the vehicle as a PDF

#### **Row-Level Options**

* Edit: Opens task for modification  
* Delete: Removes task  
* Mark as Sold: Updates vehicle status if task completion leads to sale

### **4\. UI Behavior**

* Pending tasks highlighted (e.g., yellow)  
* Assigned field shows dropdown with user list  
* Notes field editable per task  
* Notification appears on successful task addition (e.g., “Task added successfully”)

## **Assessment Tab – Vehicle Inspection Workflow**

### **1\. Tab Location**

* Appears in the top navigation bar of the vehicle view Including navigation tabs Details, Tasks, Assessment, Parts & Expenses, Central Dispatch, Timeline

### **2\. Assessment Table Structure**

| Column | Description |
| ----- | ----- |
| \# | Serial number of the assessment |
| Vehicle | Auto-filled with vehicle name |
| Assessment Date | Date of inspection |
| Assessment Time | Time of inspection |
| Conducted Name | Name or email of inspector |
| Status | Status of assessment (e.g., Completed, Pending) |
| Icon | Visual indicator (optional) |
| File | Uploaded assessment file (if any) |

### **3\. Actions**

#### **Add Assessment**

Opens a multi-tab form with the following sections:

* **Vehicle Info**  
  * Assessment Date (`dd-mm-yyyy`)  
    * Assessment Time (`hh:mm`)  
    * Conductor Name (email or name)  
    * Miles In  
    * Color  
    * CR \#  
    * Image Upload  
  * **Dents & Scratches**  
    * Interactive car diagram  
    * Red/blue dot markers  
    * Undo/reset buttons  
  * **Defects & Fuel Level**  
    * Pre-accident / other defects (text input)  
    * Work requested / owner instructions (itemized input)  
    * Fuel gauge \+ slider for entry fuel level

####  **Download \-\>**Exports current assessment records for the vehicle

### **4\. Submission Behavior**

* “Submit” button finalizes the assessment  
* Data is saved to the vehicle record  
* Status updates to “Completed” or “Pending” based on input  
* Uploaded files and notes are linked to the assessment entry

## **Parts & Expense Tab – Vehicle-Level Expense Management**

### **1\. Tab Location** Appears in the top navigation bar of the vehicle view Including navigation tabs Details, Tasks, Assessment, Parts & Expenses, Central Dispatch, Timeline

### **2\. Expense Table Structure**

| Column | Description |
| ----- | ----- |
| \# | Serial number of the expense entry |
| Vehicle | Auto-filled with vehicle name |
| Expense | Description of the part or service |
| Date | Date of expense (`dd-mm-yyyy`) |
| Cost | Amount spent (numeric) |
| Note | Additional context or reference |

### **3\. Actions**

#### **Add Expense**

* Opens modal with fields:  
  * **Your Expense** (text input)  
  * **Date** (date picker)  
  * **Cost** (numeric input)  
  * **Note** (text input)  
  * **Submit** button

#### **Download button to** Exports current expense records for the vehicle

####  **Row-Level Options**

* **Edit**: Opens expense entry for modification  
* **Delete**: Removes expense entry

### **4\. UI Behavior**

* Table displays “No expenses found” if empty  
* Successfully added expenses appear instantly  
* Notes and cost fields are editable  
* Dropdowns and buttons must be responsive across screen sizes.

## **Central Dispatch Tab – Vehicle Transport Management**

### **1\. Tab Location** Appears in the top navigation bar of the vehicle view Including navigation tabs Details, Tasks, Assessment, Parts & Expenses, Central Dispatch, Timeline

### **2\. Dispatch Entry Form**

| Field | Description |
| ----- | ----- |
| **Location** | Text input (e.g., pickup or drop-off location) |
| **Transport Company** | Text input (e.g., carrier name) |
| **Transport Cost** | Numeric input |
| **Notes** | Text box with “Add Note” button |
| **Submit** | Saves dispatch record to vehicle |

### **3\. File Management**

| Action | Description |
| ----- | ----- |
| **Upload File** | Attach transport documents |
| **Download** | Export dispatch data |

### **4\. Dispatch Records Table**

| Column | Description |
| ----- | ----- |
| \# | Serial number |
| Vehicle | Auto-filled with vehicle name |
| Location | Dispatch location |
| Transport Company | Carrier name |
| Address | Street address |
| ST/ZIP | State and ZIP code |
| AC/ASSIGN-CARRIER | Assigned carrier or dispatch code |
| File | Attached document |
| Action | Options: View, Edit |

### **5\. UI Behavior**

* Form must validate required fields before submission  
* “Central Dispatch data added successfully” notification appears on save  
* Table updates instantly with new record  
* Responsive layout across screen sizes

## **Timeline Tab – Vehicle Activity Log**

### **1\. Tab Location** Appears in the top navigation bar of the vehicle view Including navigation tabs Details, Tasks, Assessment, Parts & Expenses, Central Dispatch, Timeline

### **2\. Timeline Table Structure**

| Column | Description |
| ----- | ----- |
| \# | Serial number of the event |
| Action | Description of what occurred (e.g., Task added, Expense logged) |
| User | Name of the user who performed the action |
| Date | Date of the event (`yyyy-mm-dd`) |
| Time | Time of the event (`hh:mm:ss`) |
| Cost | Associated cost (if applicable) |
| Expense | Expense value (if applicable) |
| Note | Any notes or references tied to the action |
| Status | Status label (e.g., Asset, Pending, Completed) |

### **3\. Behavior & Logic**

* Events must be logged in **chronological order**  
* Each action performed in other tabs (Tasks, Expenses, Dispatch, etc.) should automatically generate a timeline entry  
* **Duplicate entries must be prevented** — each event should appear only once  
* Notifications (e.g., “Central Dispatch data saved successfully”) should not trigger duplicate timeline rows

### **4\. UI Behavior**

* Table must be paginated for long histories  
* Responsive layout across screen sizes  
* Footer includes links: About, Privacy Policy, Licensing, Contact

Thanks, Ayesha — based on your latest images and system flow, here’s the **precise breakdown** of the **Buyer Withdrew Tab** inside the Inventory Module:

---

## **Buyer Withdrew Tab** 

### **1\. Sidebar Integration**

* Appears under the **Inventory Section** as a dropdown option:  
  * **All**  
  * **Buyer Withdrew**

### **2\. Table Structure**

| Column | Description |
| ----- | ----- |
| Vehicle | Make & model of the withdrawn vehicle |
| Purchase Date | Date of original purchase attempt (can be blank) |
| Status | Must show **Withdrew** |
| Odometer | Mileage at time of withdrawal |
| Car Location | Dropdown: Missing, Shop/Mechanic, Auction, Other Mechanic, Unknown, Other |
| Bought Price | Price offered or paid before withdrawal |
| Title Status | Dropdown: Absent, Released, Present, etc. |
| Options Menu | Actions: View Details, Edit Vehicle, Release Title, Mark as Sold, Download |

### **3\. Behavior & Logic**

* Vehicles shown here must have **Status \= Withdrew**  
* Title Status and Car Location must be editable via dropdown  
* Missing fields (e.g., Location, Title) must be highlighted in **red**  
* Dropdowns must reflect current values and be editable  
* Pagination and filters must work independently from the “All” tab  
* “Add New” and “Import Data” buttons must follow same validation rules as Inventory All

### **4\. UI Actions**

* **View Details**: Opens the Details tab (not Timeline)  
* **Edit Vehicle**: Opens full vehicle form for updates  
* **Release Title**: Updates title status to Released  
* **Mark as Sold**: Moves vehicle to Sold status  
* **Download**: Exports current filtered list

The Buyer Withdrew section must support the same tab structure and functionality as the standard ALL Tab.

**5\. System-Level Requirements**

• All tabs must be fully functional and independent of Inventory → All

• Data must persist and sync across modules

• Buyer Withdrew vehicles must be treated as active records with full lifecycle tracking

• Filters, exports, and dropdowns must reflect current values and be editable

Perfect, Ayesha — based on the full set of images you've shared, here's a **complete specification** for the **Event Module**, written to ensure the system understands both the **functional scope** and the **UI expectations**:

---

Perfect, Ayesha — here’s the updated **Event Module Specification** with **notification logic** clearly defined for system implementation:

---

## **Event Module – Functionl Specification with Notifications**

### **1\. Sidebar Integration**

* Appears under the **Events** section in the sidebar  
* Dropdown options:  
  * **All** → View all scheduled events  
  * **Create Event** → Open event creation form

### **2\. Create Event Form**

| Field | Description |
| ----- | ----- |
| **Event Title** | Text input (e.g., “Inspection Day”, “Car Mela”) |
| **Event Date** | Date picker (`dd-mm-yyyy`) |
| **Event Time** | Time picker (`hh:mm AM/PM`) |
| **Assign to User** | Dropdown: Admin User, Transporter User, Staff, Momina, Aftab, Ayesha Magsi, etc. |
| **Save Event** | Button to submit and save the event |

### **3\. Events List View**

| Column | Description |
| ----- | ----- |
| **Event Date** | Scheduled date and time |
| **Event** | Title or description |
| **User Name** | Assigned user |
| **Search Bar** | VIN-based search |
| **Options** | View, Edit, Delete |

### **4\. Notification** 

* When an event is **created**, **edited**, or **deleted**  
* When the **event time is approaching** (e.g., 24 hours or 1 hour before)  
* **In-app alerts** (e.g., top-right notification panel)

####  **Notification Content**

* Title: “Upcoming Event: \[Event Title\]”  
* Body: Includes date, time, assigned user, and any notes  
* CTA: Link to view event details or mark as completed

### **5\. UI & UX Requirements**

#### **Interface Quality**

* Clean, modern, and intuitive layout  
* Sidebar icons (car, clock, user) must be consistent  
* Form must be card-style with clear spacing and labels

#### **Responsiveness**

* Fully responsive across desktop, tablet, and mobile  
* Touch-friendly dropdowns and buttons  
* Tables must collapse or scroll elegantly on smaller screens.

**ARB Module** 

1\. **Navigation & Placement**

• Rename the Pending Tab to ARB

• Move the ARB tab directly below Inventory in the sidebar

• Ensure it behaves as a standalone module, not a filtered view

**2\. ARB vs Inventory vs Sold**

• The ARB tab is not the same as ARB status inside Inventory or Sold tabs

• It represents a transitional state for vehicles post-sale, requiring outcome resolution

**3\. Vehicle Flow Logic**

From Sold to ARB

• When a vehicle is marked as Sold, it appears in the Sold tab

• if its status is changed to ARB, it must move to the ARB tab

**ARB Outcome Dropdown**

• Inside the ARB tab, each vehicle must show a dropdown labeled Outcome:

• Buyer Withdrew

• Buyer Bought

**4\. Outcome-Based Behavior**

 Buyer Withdrew

• Vehicle must return to Inventory tab

• Status should update accordingly

• Timeline must log this transition

Buyer Bought

• An input field must appear to enter Adjustment Amount

• This amount must:

• Be copied into the Parts & Expenses tab

• Be deducted from the profit calculation

• Vehicle must then move back to the Sold tab

**5\. Buyer History Logic**

• If a vehicle has prior buyer history (from Sold tab):

• A link must appear in the ARB tab

• Clicking it should show a full history of buyer interactions

**6\. UI & UX Requirements**

Interface Quality

• Must be clean, modern, and intuitive

• Dropdowns, input fields, and transitions must be styled consistently

• Outcome logic must be clearly visible and easy to interact with

Responsiveness

• Fully responsive across desktop, tablet, and mobile

• Tables and modals must adapt to screen size

**UX Fixes**

• Sold Price input must be enabled and visible when a vehicle is marked Sold

• “Successfully changed” pop-up must be throttled or limited to one-time display per action

## **Chat Module – Role-Based Messaging System**

### **1\. Module Placement**

* Sidebar label: **Chat**  
* Subsections:  
  * **All Messages**  
  * **Smart Messages Setup**  
  * **Your Space** (optional for saved threads or starred chats)

2. ### All roles must support **two-way messaging.** All users can chat with each other like Sellers can chat with each other and admin and Transporters.

* Role-based visibility must be enforced (no unauthorized access)

### **3\. Chat Features**

* Show **online/available users** with green dot or status badge  
* Offline users should appear grayed out or with “Last seen” timestamp.

#### **Messaging Capabilities**

* Real-time text exchange  
* **Emojis** support (inline picker or shortcut)  
* **Typing indicators** (e.g., “Ayesha is typing…”)  
* **Read receipts** (optional toggle)  
* **Message reactions** (👍 ❤️ 😂 etc.)

### **4\. UI & UX Requirements**

#### 

* Clean, modern layout with:  
  * Left panel: user list \+ search bar  
  * Center panel: active chat thread  
  * Right panel: user details or chat metadata  
* Chat bubbles must be styled per sender (e.g., left/right alignment)  
* Emoji picker must be intuitive and mobile-friendly  
* Unread messages count should be shown.

### **5\. System-Level Behavior**

* In-app alerts for new messages  
* “New message” badge on sidebar

**Sold Module :** 

### **1\. Sidebar Placement**

* Appears under the **Chat** section in the sidebar labeled as Sold  
* Must behave as a **fully standalone operational module**, not just a filtered view

### **2\. Form Behavior**

* The **Add Vehicle form** in the Sold tab must mirror Inventory → Add Vehicle  
* Required fields:  
  * Make, Model, Year, VIN  
  * Purchase Date  
  * Status (default: Sold)  
  * Pickup Location  
  * Odometer  
  * Bought Price  
  * Sold Price (must be editable)  
  * Title Status  
  * ARB Status

3. ### **Additional Details Section**

* Uploading a file redirects to Vehicle Details — must be corrected  
* Unable to upload files or add notes — must be enabled

#### **Expected Behavior**

* **Image/File Upload**: Supports JPG, PNG, PDF  
* **Notes**: Free-text input with “Add Note” and “Save” buttons  
* All uploads and notes must persist and remain editable  
* Section must be responsive and styled consistently

### **4\. Sold List Table Structure**

| Column | Description |
| ----- | ----- |
| Vehicle | Make & model |
| Purchase Date | Acquisition date |
| Import Date | Optional |
| Sale Date | Final sale date |
| Car Location | Dropdown |
| Sold Price | Editable |
| Bought Price | Editable |
| Net Profit | Auto-calculated |
| Title Status | Dropdown |
| Status | Dropdown: Sold, ARB, Withdrew, Cancelled, etc. |

### **5\. Accounting Logic**

#### **Net Profit Calculation**

* Formula:  
   **Sold Price – (Purchase Price \+ Parts & Expenses)**  
* Must update dynamically when any value changes  
* Adjustment amounts from ARB tab must be included  
* Net Profit must appear in the Sold List and be exportable

#### **Future Enhancements**

* Additional accounting rules (e.g., tax, commission, transport cost) to be defined later

### **6\.  Buyer Withdrew Logic**

#### **Outcome Flow**

* If a vehicle in Sold tab is marked as **Buyer Withdrew**:  
  * It must **move to Buyer Withdrew tab**  
  * Status updates to “Withdrew”  
  * Timeline logs the transition  
  * Title and location fields remain editable

### **7\. List Enhancements**

#### **Counters**

* All list views (Sold, Pending, Buyer Withdrew) must show:  
  * **Record counters** (e.g., “Showing 12 vehicles”)

#### **Status Dropdowns**

* Must be present in all list views  
* Options: Sold, Pending, ARB, Withdrew, Cancelled, In Progress, etc.  
* Changing status must trigger appropriate tab movement

### **8\. UI & UX Requirements**

* Clean, modern, and intuitive layout  
* Red highlight for missing title status or location  
* Responsive across desktop, tablet, and mobile  
* Notification pop-ups (e.g., “Successfully changed”) must be throttled to avoid repetition.

Thanks, Ayesha — here's the **final, consolidated specification** for the **Accounting Module**, fully aligned with your ERP structure and integrating all dashboard, reporting, and logic requirements across **Sold**, **Purchases**, **Profit**, and **Status Tracking**.

---

## **Accounting Module – Unified ERP Specification**

---

### **1\. Navigation Structure**

* Sidebar label: **Accounting**  
* Dropdown menu includes:  
  * **Summary**  
  * **Purchases**  
  * **Sold**  
  * **Reports**

### **2\. Summary Dashboard**

| Metric | Description |
| ----- | ----- |
| **Total Sales** | Sum of all sold vehicle prices |
| **Total Purchases** | Sum of all bought vehicle prices |
| **Net Profit** | Sold Price – (Purchase Price \+ Parts & Expenses \+ Adjustments) |
| **Gross Profit** | Same as Net Profit unless additional costs are added |
| **Avg Price** | Average sold price across all vehicles |

* Each card must show:  
  * Value  
  * Order count  
  * Weekly change %  
  * Trend indicator (up/down)  
* Responsive layout across devices

### **3\. Purchases Dashboard**

| Source | Description |
| ----- | ----- |
| **All Auctions** | Aggregated dealer count and order volume |
| **Manheim** | Store count, purchase count, weekly change |
| **Carmax** | Store count, purchase count |
| **Adesa** | Store count, purchase count |

* Each card must show:  
  * Store count  
  * Purchase volume  
  * Weekly change  
  * Source-specific breakdown

### **4\. Sold Dashboard**

| Card | Description |
| ----- | ----- |
| **All (19)** | Total sold vehicles |
| **Payment Received (2)** | Vehicles with confirmed payment |
| **Payment Pending (1)** | Vehicles awaiting payment |

* Each card must show:  
  * Count  
  * Percentage breakdown (e.g., 2/19 \= 10%)  
  * Weekly trend indicators  
* Must link to detailed Sold List view

### **5\. Reports Dashboard**

| Report Type | Description |
| ----- | ----- |
| **Purchases** | Total purchase value and trend |
| **Sold (Orders)** | Total sold value and trend |
| **Profit** | Net profit across all vehicles |
| **Loss** | Vehicles with negative margin |
| **Avg Price** | Average sold price |
| **Vendor Purchases** | Total purchases by vendor |
| **Vendor Sales** | Total sales by vendor |

* Each card must show:  
  * Value  
  * Weekly change %  
  * Indicator (e.g., \+18k this week)  
* Search bar must support VIN, title, or vendor lookup

---

### **6\. Profit Calculation Logic**

#### **Formula**

**Net Profit \= Sold Price – (Purchase Price \+ Parts & Expenses \+ ARB Adjustments)**

 **Dynamic Updates**

* Profit must auto-update when:  
  * Sold Price is edited  
  * Parts & Expenses are added  
  * ARB adjustment amount is entered  
* Profit must appear in:  
  * Sold List  
  * Accounting Summary  
  * Reports tab

### **7\. 🔁 Status & Movement Logic**

| Status | Behavior |
| ----- | ----- |
| **Sold** | Vehicle appears in Sold tab |
| **Buyer Withdrew** | Vehicle moves to Buyer Withdrew tab |
| **ARB** | Vehicle moves to ARB tab |
| **Pending** | Vehicle remains in intake stage |
| **Cancelled** | Vehicle is archived or flagged |

* Status dropdown must be present in all list views  
* Changing status must trigger appropriate tab movement  
* Timeline must log all transitions

### **8\. Additional Details & Uploads**

* File uploads must remain within the Sold tab (no redirection to Vehicle Details)  
* Notes must be editable and persist  
* Uploads must support JPG, PNG, PDF  
* Section must be responsive and styled consistently

### **9\. 📱 UI & UX Requirements**

* Clean, modular dashboard layout  
* Color-coded metrics (e.g., green for profit, red for loss)  
* Responsive across desktop, tablet, and mobile  
* Pagination for large datasets  
* Search bar for VIN lookup  
* Notification pop-ups (e.g., “Successfully changed”) must be throttled.

## **VIN Decode Module – Specification for Vehicle Identification & Record Linking**

### **1\.  Module Placement**

* Sidebar label: **Vin Decode**  
* Appears as a standalone module, not nested under Inventory or Accounting

### **2\. Input Interface**

| Field | Description |
| ----- | ----- |
| **Enter VIN** | Text input field for 17-character VIN |
| **Scan Button** | Optional trigger for camera or barcode scanner |
| **Decode VIN** | Button to initiate decoding and fetch vehicle data |

* Input must validate:  
  * Length \= 17 characters  
  * Alphanumeric format  
* Error message if VIN is invalid or not found

### **3\. Decode Logic**

#### **✅ Expected Output**

* Make, Model, Year  
* Engine Type  
* Transmission  
* Country of Origin  
* Manufacturer  
* Body Style  
* Fuel Type  
* Optional: Auction History or Title Status (if linked)

#### **Record Linking**

* If VIN matches an existing vehicle in Inventory, Sold, or ARB:  
  * Show link to open full record  
  * Display status (e.g., “Sold”, “Pending”, “Withdrew”)  
  * Show timeline of actions taken on that VIN

### **4\. Record Creation (Optional Phase)**

* After decoding, user can choose to:  
  * **Create New Vehicle Record** (pre-fill form with decoded data)  
  * **Attach to Existing Record** (if VIN already exists)

### **5\. UI & UX Requirements**

* Clean, centered layout with:  
  * Input field  
  * Scan button  
  * Decode button  
* Responsive across desktop, tablet, and mobile  
* Footer links: About, Privacy Policy, Licensing, Contact  
* Admin User profile visible in top-right

### **6\. System-Level Behavior**

* VIN decoding must be fast and accurate  
* Must support integration with external VIN databases (if available)  
* All decoded data must be stored and retrievable  
* Scan button must trigger device camera or barcode scanner (if supported)

# **Auto Inventory ERP – Unified Module Specification**

## **1\. System Settings Module**

### **📍 Sidebar Placement**

* Label: **Settings**  
* Subsections:  
  * **My Account**  
  * **Events**  
  * **Staff**  
  * **Transporter**

### **🧾 My Account Panel**

| Field | Behavior |
| ----- | ----- |
| **Username** | Display-only |
| **Email** | Editable |
| **Select Role** | Dropdown: Admin, Seller, Transporter |
| **Change Password** | Opens secure modal |
| **Enable 2FA** | Activates two-factor authentication |

* Must support role-based access control  
* 2FA toggle must persist and reflect status  
* Responsive layout across devices

## **2\. VIN Decode Module**

### **Sidebar Placement**

* Label: **Vin Decode**

### **Input Interface**

* Field: 17-character VIN input  
* Buttons: **Scan** (camera/barcode), **Decode VIN**

### **Decode Logic**

* Output: Make, Model, Year, Engine, Transmission, Country, Body Style  
* If VIN matches existing record:  
  * Show link to open full record  
  * Display current status (Sold, ARB, Withdrew, etc.)  
  * Show timeline of actions

###  **Optional Actions**

* Create new vehicle record (pre-filled)  
* Attach to existing record

## **3\. Accounting Module**

### **Sidebar Placement**

* Label: **Accounting**  
* Subsections: Summary, Purchases, Sold, Reports

### **Summary Dashboard**

| Metric | Description |
| ----- | ----- |
| Total Sales | Sum of sold prices |
| Total Purchases | Sum of bought prices |
| Net Profit | Sold – (Purchase \+ Expenses \+ Adjustments) |
| Gross Profit | Same unless additional costs added |
| Avg Price | Average sold price |

### **PuRchases Dashboard**

* Source cards: All Auctions, Manheim, Carmax, Adesa  
* Metrics: Store count, purchase volume, weekly change

### **Sold Dashboard**

* Cards: All, Payment Received, Payment Pending  
* Must show counts, percentages, and trends

###  **Reports Dashboard**

* Cards: Purchases, Sold Orders, Profit, Loss, Avg Price, Vendor Purchases, Vendor Sales  
* Filters: VIN, title, vendor, date range

---

## **4\. Profit Calculation Logic**

### **Formula**

**Net Profit \= Sold Price – (Purchase Price \+ Parts & Expenses \+ ARB Adjustments)**

* Auto-updates across Sold tab, Accounting Summary, and Reports  
* Editable fields: Sold Price, Bought Price  
* Adjustment amounts from ARB must reflect here

## **5\. Status & Movement Logic**

| Status | Behavior |
| ----- | ----- |
| Sold | Appears in Sold tab |
| Buyer Withdrew | Moves to Buyer Withdrew tab |
| ARB | Moves to ARB tab |
| Pending | Intake stage |
| Cancelled | Archived or flagged |

* Status dropdown must be present in all list views  
* Timeline must log all transitions

## **6\.  Additional Details & Uploads**

* File uploads must remain within the correct tab (no redirection)  
* Notes must be editable and persist  
* Uploads: JPG, PNG, PDF  
* Responsive and styled consistently

## **7\. UI & UX Standards**

* Clean, modular layout across all modules  
* Color-coded metrics and statuses  
* Responsive across desktop, tablet, and mobile  
* Search bars for VIN, title, vendor  
* Notification pop-ups must be throttled


