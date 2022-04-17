/// <reference types="Cypress" />
const path = require("path");

const locationSearch = 'New York'

describe('Login to Express app', function () {
    beforeEach(function () {
        cy.fixture('example').then(function (data) {
            this.data = data
        })
    })

    it('Enter to express app', function () {
        cy.visit(this.data.HubzityExpressBaseURL)
    })

    it('Go to campaign creation', function () {
        cy.get('.top-section > .content > button.ng-scope').click()
    })
})

describe('Locations and map', function () {
    beforeEach(function () {
        cy.fixture('example').then(function (data) {
            this.data = data
        })
    })



    it('Search for location', function () {
        const param = locationSearch.split(' ')
        cy.get('.search-location-field').type(locationSearch)
        cy.get('.targeted-locations').should('be.visible')
        cy.checkApiLoadExpress(`${this.data.API_BASE_URL_PROD}/locations/find_locations?address=${[param[0]]}+${[param[1]]}`)
    })

    it('Select the first and main option', function () {
        cy.get('.item').should('contain', locationSearch)
        cy.get('.item').eq(0).click()
    })
})

describe('Audience targeting section', function () {
    beforeEach(function () {
        cy.fixture('example').then(function (data) {
            this.data = data
        })
    })

    function getApi(urlToTest) {
        const apiToTest = {
            method: 'GET',
            url: urlToTest,
            headers: {},
            body: {}
        }
        return apiToTest
    }

    it('Test raduis change', function () {
        const radiuses = [250, 500, 1000, 2500, 5000, 10000, 200000]
        const radiusesStr = ['250', '500', '1,000', '2,500', '5,000', '10,000', '20,000']
        for (let i = 0; i < 2; i++) {
            cy.get('.input-group-btn > .btn').click()
            cy.get('.dropdown-menu').contains(`${radiusesStr[i]} meters`).click()
            cy.wait(5000)
            cy.request(getApi(`${this.data.API_BASE_URL_PROD}/geo_insights/impressions?alt_source=true&lat=40.7127753&lng=-74.0059728&targeting_radius=${radiuses[i]}&yob_max=2006&yob_min=1952`)).then(res => {
                cy.log(res.body.users)
                cy.get('.total-stats > .ng-scope > .ng-binding').then($imp => {
                    let impressions = $imp.text()
                    impressions = Number(impressions.replace(/\$|,/g, ''))
                    expect(impressions).to.be.closeTo(res.body.users, 100)
                    if (i > 0) {
                        expect(impressions).to.be.greaterThan(1000000)
                    }
                })
            })
            cy.checkApiLoadExpress(`${this.data.API_BASE_URL_PROD}/geo_insights/points?alt_source=true&lat=40.7127753&lng=-74.0059728&targeting_radius=${radiuses[i]}&yob_max=2006&yob_min=1952`)
            cy.checkApiLoadExpress(`${this.data.API_BASE_URL_PROD}/geo_insights/gender?alt_source=true&lat=40.7127753&lng=-74.0059728&targeting_radius=${radiuses[i]}&yob_max=2006&yob_min=1952`)
            cy.checkApiLoadExpress(`${this.data.API_BASE_URL_PROD}/geo_insights/age_groups?alt_source=true&lat=40.7127753&lng=-74.0059728&targeting_radius=${radiuses[i]}`)
            cy.get('.input-group-btn > .btn').click()
            cy.get('.dropdown-menu').contains(`500 meters`).click()
        }
    })

    it('Gender change test', function () {
        const genders = ['Male', 'Female']
        const genders2 = ['male', 'female']
        for (let i = 0; i < genders.length; i++) {
            cy.get('.group-selection').contains(genders[i]).click()
            cy.checkApiLoadExpress(`${this.data.API_BASE_URL_PROD}/geo_insights/impressions?alt_source=true&gender=${genders2[i]}&lat=40.7129032&lng=-74.0063033&targeting_radius=500&yob_max=2006&yob_min=1952`)
            cy.checkApiLoadExpress(`${this.data.API_BASE_URL_PROD}/geo_insights/points?alt_source=true&gender=${genders2[i]}&lat=40.7129032&lng=-74.0063033&targeting_radius=500&yob_max=2006&yob_min=1952`)
            cy.checkApiLoadExpress(`${this.data.API_BASE_URL_PROD}/geo_insights/gender?alt_source=true&gender=${genders2[i]}&lat=40.7129032&lng=-74.0063033&targeting_radius=500&yob_max=2006&yob_min=1952`)
            cy.checkApiLoadExpress(`${this.data.API_BASE_URL_PROD}/geo_insights/age_groups?alt_source=true&gender=${genders2[i]}&lat=40.7129032&lng=-74.0063033&targeting_radius=500`)
        }
        cy.get('.group-selection').contains('All').click()
    })

    it('Show advanced insights', function () {
        cy.get('.content-container > .btn').click()
        cy.get('.modal-content').should('be.visible')
        cy.get('.modal').click('left')
    })

    it('Age slide test', function () {
        const minYear = 1952
        const maxYear = 2006
        cy.get('.rz-pointer-min').focus().type("{rightarrow}{rightarrow}{rightarrow}")
        cy.wait(4000)
        cy.get('.rz-pointer-max').focus().type("{leftarrow}{leftarrow}{leftarrow}")
        cy.checkApiLoadExpress(`${this.data.API_BASE_URL_PROD}/geo_insights/impressions?alt_source=true&lat=40.7129032&lng=-74.0063033&targeting_radius=500&yob_max=${maxYear - 3}&yob_min=${minYear + 3}`)
        cy.checkApiLoadExpress(`${this.data.API_BASE_URL_PROD}/geo_insights/points?alt_source=true&lat=40.7129032&lng=-74.0063033&targeting_radius=500&yob_max=${maxYear - 3}&yob_min=${minYear + 3}`)
        cy.checkApiLoadExpress(`${this.data.API_BASE_URL_PROD}/geo_insights/gender?alt_source=true&lat=40.7129032&lng=-74.0063033&targeting_radius=500&yob_max=${maxYear - 3}&yob_min=${minYear + 3}`)

    })
})

describe('Business details', function () {
    beforeEach(function () {
        cy.fixture('example').then(function (data) {
            this.data = data
        })
    })

    function getApi(urlToTest) {
        const apiToTest = {
            method: 'GET',
            url: urlToTest,
            headers: {},
            body: {}
        }
        return apiToTest
    }

    it('Go to business details section', function () {
        cy.get('.footerControls > .btn').click()
        cy.url().should('eq', `${this.data.HubzityExpressBaseURL}/business_details`)
    })

    it('Enter campaign name', function () {
        cy.get('.form-group > .form-control').type('Liel Test')
    })

    it('Check hours', function () {
        const startHour = '10:00 AM'
        const endHour = '09:00 PM'
        cy.get('div.ng-scope > :nth-child(1) > .form-control').select(startHour)
        cy.get(':nth-child(2) > .form-control').select(endHour)
        cy.get('div.ng-scope > :nth-child(1) > .form-control').find(':selected').then($start => {
            expect($start.text()).to.eq(startHour)
        })
        cy.get(':nth-child(2) > .form-control').find(':selected').then($end => {
            expect($end.text()).to.eq(endHour)
        })
    })

    it('Open all day test', function () {
        cy.get('.layout-wrap > md-checkbox > .md-container').click()
        cy.get('div.ng-scope > :nth-child(1) > .form-control').should('not.exist')
        cy.get(':nth-child(2) > .form-control').should('not.exist')
    })
})

describe('Create your ad section', function () {
    beforeEach(function () {
        cy.fixture('example').then(function (data) {
            this.data = data
        })
    })

    function getApi(urlToTest) {
        const apiToTest = {
            method: 'GET',
            url: urlToTest,
            headers: {},
            body: {}
        }
        return apiToTest
    }

    it('Go to Create yor ad', function () {
        cy.get('.btn-primary').click()
        cy.wait(5000)
    })
})