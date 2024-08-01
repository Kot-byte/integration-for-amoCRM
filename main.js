document.addEventListener('DOMContentLoaded', function() {
    const createJobButton = document.getElementById('createJobButton');
    const apiToken = '{YOUR TOKEN}';

    const getCustomFields = () => {
        return fetch(`https://api.pipedrive.com/v1/dealFields?api_token=${apiToken}`)
            .then(response => response.json())
            .then(result => result.data || [])
            .catch(error => {
                console.error('Error fetching custom fields:', error);
                return [];
            });
    };

    const createCustomField = (name, fieldType) => {
        return fetch(`https://api.pipedrive.com/v1/dealFields?api_token=${apiToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: name,
                field_type: fieldType,
                options: []
            })
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // console.log(`Created Field: ${name}, Key: ${result.data.key}`); 
                return result.data.key; 
            } else {
                throw new Error(result.error);
            }
        });
    };

    const createDeal = (existingFields) => {
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const jobType = document.getElementById('jobType').value;
        const jobSource = document.getElementById('jobSource').value;
        const jobDescription = document.getElementById('jobDescription').value;
        const address = document.getElementById('address').value;
        const city = document.getElementById('city').value;
        const state = document.getElementById('state').value;
        const zipCode = document.getElementById('zipCode').value;
        const area = document.getElementById('area').value;
        const startDate = document.getElementById('startDate').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const testSelect = document.getElementById('testSelect').value;

        const data = {
            title: `${firstName} ${lastName} - ${jobType}`,
            person_id: {
                name: `${firstName} ${lastName}`,
                email: email,
                phone: phone
            },
            [existingFields['First Name']]: firstName,
            [existingFields['Last Name']]: lastName,
            [existingFields['Phone']]: phone,
            [existingFields['Email']]: email,
            [existingFields['Job Type']]: jobType,
            [existingFields['Job Source']]: jobSource,
            [existingFields['Job Description']]: jobDescription,
            [existingFields['Address']]: address,
            [existingFields['City']]: city,
            [existingFields['State']]: state,
            [existingFields['Zip Code']]: zipCode,
            [existingFields['Area']]: area,
            [existingFields['Start Date']]: startDate,
            [existingFields['Start Time']]: startTime,
            [existingFields['End Time']]: endTime,
            [existingFields['Test Select']]: testSelect
        };


        return fetch(`https://api.pipedrive.com/v1/deals?api_token=${apiToken}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(result => {
            // console.log('Deal Creation Result:', result);
            createJobButton.style.backgroundColor = "red";
            createJobButton.textContent = "Request in sent";
            alert('Deal created successfully!');
            if (result.data && result.data.id) {
                const dealId = result.data.id;
                const dealUrl = `https://clickup2.pipedrive.com/deal/${dealId}`;
                window.location.href = dealUrl;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to create deal.');
        });
    };

    createJobButton.addEventListener('click', function() {
        const fieldNames = {
            firstName: 'First Name',
            lastName: 'Last Name',
            phone: 'Phone',
            email: 'Email',
            jobType: 'Job Type',
            jobSource: 'Job Source',
            jobDescription: 'Job Description',
            address: 'Address',
            city: 'City',
            state: 'State',
            zipCode: 'Zip Code',
            area: 'Area',
            startDate: 'Start Date',
            startTime: 'Start Time',
            endTime: 'End Time',
            testSelect: 'Test Select'
        };

        getCustomFields()
            .then(fields => {
                const existingFields = fields.reduce((acc, field) => {
                    acc[field.name] = field.key;
                    return acc;
                }, {}); 

                console.log('Existing Field Keys:', existingFields);

                const missingFields = Object.keys(fieldNames).filter(key => !existingFields[fieldNames[key]]);
                console.log('Missing Fields:', missingFields);

                const createNewFields = missingFields.map(key => createCustomField(fieldNames[key], 'text'));

                return Promise.all(createNewFields)
                    .then(keys => {
                        const customFieldKeys = missingFields.reduce((acc, key, index) => {
                            acc[fieldNames[key]] = keys[index];
                            return acc;
                        }, { ...existingFields });

                        console.log('Custom Field Keys:', customFieldKeys);

                        return createDeal(customFieldKeys);
                    });
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to create deal.');
            });
    });
});
