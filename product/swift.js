/*
Language: Swift
Author: Chris Eidhof <chris@eidhof.nl>
Contributors: Nate Cook <natecook@gmail.com>, Alexander Lichter <manniL@gmx.net>
Category: system
Changed by Jan Dammshaeuser <mail@jandamm.de>
*/

function clone(a) {
   return JSON.parse(JSON.stringify(a));
}

module.exports = function(hljs) {
  const SWIFT_KEYWORDS = {
    keyword: '_ __COLUMN__ __FILE__ __FUNCTION__ __LINE__ as as! as? associativity ' +
      'associatedtype break case catch class continue convenience default defer deinit didSet do ' +
      'dynamic dynamicType else enum extension fallthrough false fileprivate final for func ' +
      'get guard if import in indirect infix init inout internal is lazy left let ' +
      'mutating nil none nonmutating open operator optional override postfix precedence ' +
      'prefix private protocol Protocol public repeat required rethrows return ' +
      'right self set static struct subscript super switch throw throws true ' +
      'try try! try? Type typealias unowned var weak where while willSet',
    literal: 'true false nil',
  };
  const SWIFT_FUNC = {
    built_in: 'abs advance alignof alignofValue anyGenerator assert assertionFailure ' +
      'bridgeFromObjectiveC bridgeFromObjectiveCUnconditional bridgeToObjectiveC ' +
      'bridgeToObjectiveCUnconditional c contains count countElements countLeadingZeros ' +
      'debugPrint debugPrintln distance dropFirst dropLast dump encodeBitsAsWords ' +
      'enumerate equal fatalError filter find getBridgedObjectiveCType getVaList ' +
      'indices insertionSort isBridgedToObjectiveC isBridgedVerbatimToObjectiveC ' +
      'isUniquelyReferenced isUniquelyReferencedNonObjC join lazy lexicographicalCompare ' +
      'map max maxElement min minElement numericCast overlaps partition posix ' +
      'precondition preconditionFailure print println quickSort readLine reduce reflect ' +
      'reinterpretCast reverse roundUpToAlignment sizeof sizeofValue sort split ' +
      'startsWith stride strideof strideofValue swap toString transcode ' +
      'underestimateCount unsafeAddressOf unsafeBitCast unsafeDowncast unsafeUnwrap ' +
      'unsafeReflect withExtendedLifetime withObjectAtPlusZero withUnsafePointer ' +
      'withUnsafePointerToObject withUnsafeMutablePointer withUnsafeMutablePointers ' +
      'withUnsafePointer withUnsafePointers withVaList zip'
  };
  const SWIFT_VAR = {
    built_in: 'first'
  };
  const SWIFT_TYPES = {
    built_in: 'Element Iterator IteratorProtocol Sequence String Void'
  };

  const TYPE = {
    className: 'type',
    begin: '\\b[A-Z][\\w\u00C0-\u02B8\']*',
    keywords: SWIFT_TYPES,
    relevance: 0,
    illegal: ':',
    contains: [
      {
        className: 'built_in',
        begin: '(UI|NS|CG)[A-Z][\\w\u00C0-\u02B8\']+'
      }
    ]
  };
  const VAR = {
    className: 'variable',
    begin: '\\b[a-z][\\w\u00C0-\u02B8\']*[^(]',
    keywords: SWIFT_KEYWORDS,
    relevance: 0,
    illegal: ':'
  };
  const GENERIC_TYPES = {
    begin: /</, end: />/, endsParent: true,
    contains: [{
      begin: ': ',
      contains: [
        TYPE
      ]
    }],
    illegal: /["'<>:]/
  };
  const ASSOC = {
    className: 'assoc',
    begin: /(associatedtype|typealias) /, end: /[(\n| |:)]/,
    keywords: 'associatedtype typealias',
    contains: [TYPE]
  }
  const BLOCK_COMMENT = hljs.COMMENT(
    '/\\*',
    '\\*/',
    {
      contains: ['self']
    }
  );
  const NUMBERS = {
      className: 'number',
      begin: '\\b([^$]\\d[\\d_]*(\\.[\\deE_]+)?|0x[a-fA-F0-9_]+(\\.[a-fA-F0-9p_]+)?|0b[01_]+|0o[0-7_]+)\\b',
      relevance: 0
  };
  const SUBST = {
    className: 'subst',
    begin: /\\\(/, end: '\\)',
    keywords: SWIFT_KEYWORDS,
    contains: [NUMBERS] // assigned later
  };
  const QUOTE_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, {
    contains: [SUBST, hljs.BACKSLASH_ESCAPE]
  });

  return {
    keywords: SWIFT_KEYWORDS,
    contains: [
      QUOTE_STRING_MODE,
      hljs.C_LINE_COMMENT_MODE,
      BLOCK_COMMENT,
      TYPE,
      NUMBERS,
      ASSOC,
      {
        className: 'function',
        beginKeywords: 'func', end: '{', excludeEnd: true,
        contains: [
          GENERIC_TYPES,
          {
            className: 'params',
            begin: /\(/, end: /\)/, endsParent: true,
            keywords: SWIFT_KEYWORDS,
            contains: [
              'self',
              NUMBERS,
              GENERIC_TYPES,
              QUOTE_STRING_MODE,
              hljs.C_BLOCK_COMMENT_MODE,
              {begin: ':'} // relevance booster
            ],
            illegal: /["']/
          }
        ],
        illegal: /\[|%/
      },
      {
        className: 'class',
        beginKeywords: 'struct protocol class enum',
        keywords: SWIFT_KEYWORDS,
        end: '\\{',
        excludeEnd: true,
        contains: [
          hljs.inherit(hljs.TITLE_MODE, {begin: /[A-Za-z$_][\u00C0-\u02B80-9A-Za-z$_]*/}),
         GENERIC_TYPES
        ]
      },
      {
        className: 'class',
        beginKeywords: 'extension',
        keywords: SWIFT_KEYWORDS,
        end: '\\{',
        excludeEnd: true,
        contains: [
          TYPE,
         GENERIC_TYPES
        ]
      },
      {
        className: 'meta', // @attributes
        begin: '(@warn_unused_result|@exported|@lazy|@noescape|' +
                  '@NSCopying|@NSManaged|@objc|@convention|@required|' +
                  '@noreturn|@IBAction|@IBDesignable|@IBInspectable|@IBOutlet|' +
                  '@infix|@prefix|@postfix|@autoclosure|@testable|@available|' +
                  '@nonobjc|@NSApplicationMain|@UIApplicationMain)'

      },
      {
        beginKeywords: 'import', end: /$/,
        contains: [hljs.C_LINE_COMMENT_MODE, BLOCK_COMMENT]
      }
    ]
  };
}
