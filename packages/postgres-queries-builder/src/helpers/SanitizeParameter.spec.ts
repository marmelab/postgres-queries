import { sanitizeParameter } from './SanitizeParameter';

describe('sanitizeParameter', () => {
    it('should keep only attributes passed in first argument', () => {
        const columns = ['name', 'firstname', 'mail'];
        const object = {
            firstname: 'john',
            from_date: '2016-01-01',
            like_password: '*',
            mail: 'john.doe@mail.com',
            name: 'doe',
            password: 'secret',
            to_date: '2020-12-12',
        };

        expect(sanitizeParameter(columns, object)).toEqual({
            firstname: 'john',
            mail: 'john.doe@mail.com',
            name: 'doe',
        });
    });

    it('should keep from_ attributes matching one first argument', () => {
        const columns = ['name', 'firstname', 'mail', 'date'];
        const object = {
            firstname: 'john',
            from_date: '2012-12-12',
            mail: 'john.doe@mail.com',
            name: 'doe',
        };

        expect(sanitizeParameter(columns, object)).toEqual({
            firstname: 'john',
            from_date: '2012-12-12',
            mail: 'john.doe@mail.com',
            name: 'doe',
        });
    });

    it('should keep to_ attributes matching one first argument', () => {
        const columns = ['name', 'firstname', 'mail', 'date'];
        const object = {
            firstname: 'john',
            mail: 'john.doe@mail.com',
            name: 'doe',
            to_date: '2020-12-12',
        };

        expect(sanitizeParameter(columns, object)).toEqual({
            firstname: 'john',
            mail: 'john.doe@mail.com',
            name: 'doe',
            to_date: '2020-12-12',
        });
    });

    it('should keep like_ attributes matching one first argument', () => {
        const columns = ['name', 'firstname', 'mail'];
        const object = {
            firstname: 'john',
            like_name: 'do',
            mail: 'john.doe@mail.com',
        };

        expect(sanitizeParameter(columns, object)).toEqual({
            firstname: 'john',
            like_name: '%do%',
            mail: 'john.doe@mail.com',
        });
    });

    it('should keep not_like_ attributes matching one first argument', () => {
        const columns = ['name', 'firstname', 'mail'];
        const object = {
            firstname: 'john',
            mail: 'john.doe@mail.com',
            not_like_name: 'do',
        };

        expect(sanitizeParameter(columns, object)).toEqual({
            firstname: 'john',
            mail: 'john.doe@mail.com',
            not_like_name: '%do%',
        });
    });

    it('should keep not_ attributes matching one argument', () => {
        const columns = ['name', 'firstname', 'mail'];
        const object = {
            firstname: 'john',
            mail: 'john.doe@mail.com',
            not_name: ['do', 'dupont'],
        };

        expect(sanitizeParameter(columns, object)).toEqual({
            firstname: 'john',
            mail: 'john.doe@mail.com',
            not_name: ['do', 'dupont'],
        });
    });

    it('should not include attributes not in object if there is no default for them', () => {
        const columns = ['name', 'firstname', 'mail'];
        const object = {
            firstname: 'john',
            name: 'doe',
        };

        expect(sanitizeParameter(columns, object)).toEqual({
            firstname: 'john',
            name: 'doe',
        });
    });

    it('should replace "." by "__"', () => {
        const columns = ['user.name', 'user.firstname'];
        const object = {
            'user.firstname': 'john',
            'user.name': 'doe',
        };

        expect(sanitizeParameter(columns, object)).toEqual({
            user__firstname: 'john',
            user__name: 'doe',
        });
    });

    it('should return an empty object if columns is empty', () => {
        const columns = [];
        const object = {
            firstname: 'john',
            name: 'doe',
        };

        expect(sanitizeParameter(columns, object)).toEqual({});
    });

    it('should return default object if receiving an empty object', () => {
        const columns = {
            firstname: 'john',
            mail: 'john.doe@mail.com',
            name: 'doe',
        };
        const object = {};

        expect(sanitizeParameter(columns, object)).toEqual(columns);
    });

    it('should return empty object if receiving an empty object and no default is specified', () => {
        const columns = ['name', 'firstname', 'mail'];
        const object = {};

        expect(sanitizeParameter(columns, object)).toEqual({});
    });

    it('should accept null parameter', () => {
        const columns = ['name', 'firstname'];
        const object = {
            firstname: null,
            name: 'doe',
        };

        expect(sanitizeParameter(columns, object)).toEqual({
            firstname: null,
            name: 'doe',
        });
    });

    it('should add match parameter if there is at least one column', () => {
        const columns = ['name'];
        const object = {
            match: 'doe',
        };

        expect(sanitizeParameter(columns, object)).toEqual({
            match: '%doe%',
        });
    });
});
