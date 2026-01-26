import { TestBed } from '@angular/core/testing';
import { ImportService } from './import.service';
import { Profile } from '../models/Profile';

describe('ImportService', () => {
  let service: ImportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ImportService]
    });
    service = TestBed.inject(ImportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('parseSitePatterns', () => {
    it('should parse wildcard patterns from RDF', () => {
      const xmlString = `<?xml version="1.0"?>
        <RDF:RDF xmlns:NS1="http://passwordmaker.mozdev.org/rdf#"
                 xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <RDF:Description
            NS1:pattern0="domain1.com"
            NS1:patternenabled0="true"
            NS1:patterndesc0=""
            NS1:patterntype0="wildcard"
            NS1:pattern1="domain2.uk"
            NS1:patternenabled1="true"
            NS1:patterndesc1=""
            NS1:patterntype1="wildcard"
          />
        </RDF:RDF>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      const element = doc.getElementsByTagName('RDF:Description')[0];
      
      const patterns = service['parseSitePatterns'](element);
      
      expect(patterns.length).toBe(2);
      expect(patterns[0]).toEqual({
        pattern: 'domain1.com',
        enabled: true,
        type: 'wildcard',
        description: ''
      });
      expect(patterns[1]).toEqual({
        pattern: 'domain2.uk',
        enabled: true,
        type: 'wildcard',
        description: ''
      });
    });

    it('should parse regex patterns from RDF', () => {
      const xmlString = `<?xml version="1.0"?>
        <RDF:RDF xmlns:NS1="http://passwordmaker.mozdev.org/rdf#"
                 xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <RDF:Description
            NS1:pattern0="https?://my\\.example\\.com/.*"
            NS1:patternenabled0="true"
            NS1:patterndesc0=""
            NS1:patterntype0="regex"
          />
        </RDF:RDF>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      const element = doc.getElementsByTagName('RDF:Description')[0];
      
      const patterns = service['parseSitePatterns'](element);
      
      expect(patterns.length).toBe(1);
      expect(patterns[0].type).toBe('regex');
      expect(patterns[0].pattern).toBe('https?://my\\.example\\.com/.*');
    });

    it('should skip disabled patterns', () => {
      const xmlString = `<?xml version="1.0"?>
        <RDF:RDF xmlns:NS1="http://passwordmaker.mozdev.org/rdf#"
                 xmlns:RDF="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
          <RDF:Description
            NS1:pattern0="enabled.com"
            NS1:patternenabled0="true"
            NS1:patterntype0="wildcard"
            NS1:pattern1="disabled.com"
            NS1:patternenabled1="false"
            NS1:patterntype1="wildcard"
          />
        </RDF:RDF>
      `;
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xmlString, 'text/xml');
      const element = doc.getElementsByTagName('RDF:Description')[0];
      
      const patterns = service['parseSitePatterns'](element);
      
      expect(patterns.length).toBe(1);
      expect(patterns[0].pattern).toBe('enabled.com');
    });
  });

  describe('generateRdfExport', () => {
    it('should export patterns in RDF format', () => {
      const profile = new Profile();
      profile.name = 'Test Profile';
      profile.patterns = [
        {
          pattern: 'example.com',
          enabled: true,
          type: 'wildcard',
          description: 'Test pattern'
        },
        {
          pattern: 'https?://.*\\.test\\.com/.*',
          enabled: true,
          type: 'regex',
          description: ''
        }
      ];

      const rdf = service.generateRdfExport([profile]);
      
      expect(rdf).toContain('NS1:pattern0="example.com"');
      expect(rdf).toContain('NS1:patternenabled0="true"');
      expect(rdf).toContain('NS1:patterntype0="wildcard"');
      expect(rdf).toContain('NS1:patterndesc0="Test pattern"');
      
      expect(rdf).toContain('NS1:pattern1="https?://.*\\.test\\.com/.*"');
      expect(rdf).toContain('NS1:patternenabled1="true"');
      expect(rdf).toContain('NS1:patterntype1="regex"');
    });

    it('should not export disabled patterns', () => {
      const profile = new Profile();
      profile.name = 'Test Profile';
      profile.patterns = [
        {
          pattern: 'disabled.com',
          enabled: false,
          type: 'wildcard',
          description: ''
        }
      ];

      const rdf = service.generateRdfExport([profile]);
      
      expect(rdf).not.toContain('disabled.com');
    });

    it('should handle profiles with no patterns', () => {
      const profile = new Profile();
      profile.name = 'Test Profile';
      profile.patterns = [];

      const rdf = service.generateRdfExport([profile]);
      
      expect(rdf).toContain('NS1:name="Test Profile"');
      expect(rdf).not.toContain('NS1:pattern');
    });

    it('should escape XML special characters in patterns', () => {
      const profile = new Profile();
      profile.name = 'Test Profile';
      profile.patterns = [
        {
          pattern: 'test<>&"\'pattern',
          enabled: true,
          type: 'wildcard',
          description: 'desc<>&"\''
        }
      ];

      const rdf = service.generateRdfExport([profile]);
      
      expect(rdf).toContain('&lt;');
      expect(rdf).toContain('&gt;');
      expect(rdf).toContain('&amp;');
      expect(rdf).toContain('&quot;');
      expect(rdf).toContain('&#39;');
    });
  });

  describe('convertToProfile', () => {
    it('should convert imported patterns to Profile', () => {
      const imported = {
        title: 'Test Profile',
        patterns: [
          {
            pattern: 'example.com',
            enabled: true,
            type: 'wildcard' as const,
            description: 'Test'
          }
        ]
      };

      const profile = service.convertToProfile(imported);
      
      expect(profile.name).toBe('Test Profile');
      expect(profile.patterns.length).toBe(1);
      expect(profile.patterns[0].pattern).toBe('example.com');
    });

    it('should handle missing patterns', () => {
      const imported = {
        title: 'Test Profile'
      };

      const profile = service.convertToProfile(imported);
      
      expect(profile.patterns).toEqual([]);
    });
  });
});
