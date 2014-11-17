%lex
%%

\s+                   /* skip whitespace */

/* Keywords */
"catch"               return 'CATCH'
"class"               return 'CLASS'
"finally"             return 'FINALLY'
"interface"           return 'INTERFACE'
"let"                 return 'LET'
"return"              return 'RETURN'
"throw"               return 'THROW'
"try"                 return 'TRY'
"var"                 return 'VAR'
"namespace"           return 'NAMESPACE'
"extends"             return 'EXTENDS'
"implements"          return 'IMPLEMENTS'
"true"                return 'LITERAL_BOOL'
"false"               return 'LITERAL_BOOL'

/* Values */
[0-9]+"."[0-9]*       return 'LITERAL_DOUBLE'
[0-9]+\b              return 'LITERAL_INTEGER'
"."[0-9]+?\b          return 'LITERAL_DOUBLE'
[a-zA-Z_]+[0-9a-zA-Z_]* return 'IDENTIFIER'
"#"[a-zA-Z]+          return 'BUILTIN'

/* Operators */
'+='                  return 'ADD_ASSIGN'
'-='                  return 'SUB_ASSIGN'
'*='                  return 'MUL_ASSIGN'
'/='                  return 'DIV_ASSIGN'
'%='                  return 'REM_ASSIGN'
'<<='                 return 'SHL_ASSIGN'
'>>='                 return 'SHR_ASSIGN'
'&='                  return 'AND_ASSIGN'
'^='                  return 'XOR_ASSIGN'
'|='                  return 'OR_ASSIGN'
"=>"                  return 'ARROW'
"=="                  return 'EQ'
"!="                  return 'NE'
"<="                  return 'LE'
">="                  return 'GE'
"<<"                  return 'SHL'
">>"                  return 'SHR'
"&&"                  return 'AND'
"||"                  return 'OR'
"++"                  return 'INC'
"--"                  return 'DEC'
"*"                   return '*'
"!"                   return '!'
"~"                   return '~'
"%"                   return '%'
"/"                   return '/'
"-"                   return '-'
"+"                   return '+'
"("                   return '('
")"                   return ')'
"{"                   return '{'
"}"                   return '}'
"["                   return '['
"]"                   return ']'
"<"                   return '<'
">"                   return '>'
","                   return ','
"="                   return '='
";"                   return ';'
"?"                   return '?'
":"                   return ':'
"&"                   return '&'
"|"                   return '|'
"^"                   return '^'
"."                   return '.'

/* Special */
<<EOF>>               return 'EOF'
.                     return 'INVALID'

/lex

%start Program

%%

Program
    : Statement EOF
        {return new yy.nodes.Program([$1]);}
    | StatementList EOF
        {return new yy.nodes.Program($1);}
    ;

/* Statements */

Statement
    : ExpressionStatement
        {$$ = $1;}
    | BlockStatement
        {$$ = $1;}
    | DeclarationStatement
        {$$ = $1;}
    | ReturnStatement
        {$$ = $1;}
    | ThrowStatement
        {$$ = $1;}
    | TryStatement
        {$$ = $1;}
    ;

DeclarationStatement
    : ClassDeclaration
        {$$ = $1;}
    | NamespaceDeclaration
        {$$ = $1;}
    | VariableDeclaration
        {$$ = $1;}
    | ConstantDeclaration
        {$$ = $1;}
    ;

TryStatement
    : TRY BlockStatement CatchClauseList
        {$$ = new yy.nodes.TryStatement($2, $3, null);}
    | TRY BlockStatement CatchClauseList FINALLY BlockStatement
        {$$ = new yy.nodes.TryStatement($2, $3, $5);}
    ;

CatchClauseList
    : CatchClause
        {$$ = [$1];}
    | CatchClauseList CatchClause
        {
            $1.push($2);
            $$ = $1;
        }
    ;

CatchClause
    : CATCH '(' IDENTIFIER ':' Type ')' BlockStatement
        {$$ = new yy.nodes.CatchClause($3, $5, $7);}
    ;

ExpressionStatement
    : Expression ';'
        {$$ = new yy.nodes.ExpressionStatement($1);}
    ;

ThrowStatement
    : THROW Expression ';'
        {$$ = new yy.nodes.ThrowStatement($2);}
    ;

BlockStatement
    : '{' Statement '}'
        {$$ = new yy.nodes.BlockStatement([$2]);}
    | '{' StatementList '}'
        {$$ = new yy.nodes.BlockStatement($2);}
    | '{' '}'
        {$$ = new yy.nodes.BlockStatement();}
    ;

StatementList
    : Statement Statement
        {$$ = [$1, $2];}
    | StatementList Statement
        {
            $1.push($2);
            $$ = $1;
        }
    ;

ReturnStatement
    : RETURN ';'
        {$$ = new yy.nodes.ReturnStatement(null);}
    | RETURN Expression ';'
        {$$ = new yy.nodes.ReturnStatement($2);}
    ;

/* END Statements */

/* Declarations */

VariableDeclaration
    : VAR IDENTIFIER ':' Type ';'
        {$$ = new yy.nodes.VariableDeclaration($2, $4);}
    | VAR IDENTIFIER ':' Type '=' Expression ';'
        {$$ = new yy.nodes.VariableDeclaration($2, $4, $6);}
    | VAR IDENTIFIER '=' Expression ';'
        {$$ = new yy.nodes.VariableDeclaration($2, null, $4);}
    ;

ConstantDeclaration
    : LET IDENTIFIER ':' Type ';'
        {$$ = new yy.nodes.ConstantDeclaration($2, $4);}
    | LET IDENTIFIER ':' Type '=' Expression ';'
        {$$ = new yy.nodes.ConstantDeclaration($2, $4, $6);}
    | LET IDENTIFIER '=' Expression ';'
        {$$ = new yy.nodes.ConstantDeclaration($2, null, $4);}
    ;

NamespaceDeclaration
    : NAMESPACE NamespacePath '{' '}'
        {$$ = new yy.nodes.NamespaceDeclaration($2, []);}
    | NAMESPACE NamespacePath '{' Statement '}'
        {$$ = new yy.nodes.NamespaceDeclaration($2, [$4]);}
    | NAMESPACE NamespacePath '{' StatementList '}'
        {$$ = new yy.nodes.NamespaceDeclaration($2, $4);}
    ;

ClassDeclaration
    : TypeKeyword IDENTIFIER '{' '}'
        {$$ = new yy.nodes.ClassDeclaration($1, $2, []);}
    | TypeKeyword IDENTIFIER '{' ClassMemberList '}'
        {$$ = new yy.nodes.ClassDeclaration($1, $2, $4);}
    | TypeKeyword IDENTIFIER TypeInheritance '{' '}'
        {$$ = new yy.nodes.ClassDeclaration($1, $2, [], $3.extends, $3.implements);}
    | TypeKeyword IDENTIFIER TypeInheritance '{' ClassMemberList '}'
        {$$ = new yy.nodes.ClassDeclaration($1, $2, $5);}
    ;

TypeKeyword
    : CLASS
        {$$ = 'class';}
    | INTERFACE
        {$$ = 'interface';}
    ;

TypeInheritance
    : EXTENDS Type
        {
            $$ = {
                extends: $2,
                implements: []
            };
        }
    | IMPLEMENTS TypeList
        {
            $$ = {
                extends: null,
                implements: $2
            };
        }
    | EXTENDS Type IMPLEMENTS TypeList
        {
            $$ = {
                extends: $2,
                implements: $4
            }
        }
    ;

NamespacePath
    : IDENTIFIER
        {$$ = [$1];}
    | NamespacePath '.' IDENTIFIER
        {
            $1.push($3);
            $$ = $1;
        }
    ;

/* END Declarations */

/* Subdeclarations */

ClassMemberList
    : ClassMember
        {$$ = [$1];}
    | ClassMemberList ClassMember
        {
            $1.push($2);
            $$ = $1;
        }
    ;

ClassMember
    : ClassAttribute
        {$$ = $1;}
    | ClassMethod
        {$$ = $1;}
    ;

ClassAttribute
    : IDENTIFIER ':' Type ';'
        {$$ = new yy.nodes.MemberDeclaration('attribute', $1, $3);}
    ;

ClassMethod
    : IDENTIFIER '(' ')' BlockStatement
        {$$ = new yy.nodes.MemberDeclaration('method', $1, null, [], $4);}
    | IDENTIFIER '(' MethodParameterList ')' BlockStatement
        {$$ = new yy.nodes.MemberDeclaration('method', $1, null, $3, $5);}
    | IDENTIFIER '(' ')' ':' Type BlockStatement
        {$$ = new yy.nodes.MemberDeclaration('method', $1, $5, [], $6);}
    | IDENTIFIER '(' MethodParameterList ')' ':' Type BlockStatement
        {$$ = new yy.nodes.MemberDeclaration('method', $1, $6, $3, $7);}
    ;

MethodParameterList
    : MethodParameter
        {$$ = [$1];}
    | MethodParameterList ',' MethodParameter
        {
            $1.push($3);
            $$ = $1;
        }
    ;

MethodParameter
    : IDENTIFIER ':' Type
        {$$ = new yy.nodes.MethodParameter($1, $3);}
    ;

Type
    : IDENTIFIER
        {$$ = new yy.nodes.NamedType($1);}
    | Type '[' ']'
    | Type '<' TypeList '>'
    | '{' TypeList ARROW Type '}'
        {$$ = new yy.nodes.FunctionType($4, $2);}
    | '(' TypeList ')'
    ;

TypeList
    : Type
        {$$ = [$1];}
    | TypeList ',' Type
        {
            $1.push($3);
            $$ = $1;
        }
    ;

/* END Subdeclarations */

/* Expressions */

Expression
    : AssignmentExpression
        {$$ = $1;}
    ;

AssignmentExpression
    : LambdaExpression
        {$$ = $1;}
    | LambdaExpression '=' AssignmentExpression
        {$$ = new yy.nodes.AssignmentExpression($2, $1, $3);}
    | LambdaExpression ADD_ASSIGN AssignmentExpression
        {$$ = new yy.nodes.AssignmentExpression($2, $1, $3);}
    | LambdaExpression SUB_ASSIGN AssignmentExpression
        {$$ = new yy.nodes.AssignmentExpression($2, $1, $3);}
    | LambdaExpression MUL_ASSIGN AssignmentExpression
        {$$ = new yy.nodes.AssignmentExpression($2, $1, $3);}
    | LambdaExpression DIV_ASSIGN AssignmentExpression
        {$$ = new yy.nodes.AssignmentExpression($2, $1, $3);}
    | LambdaExpression REM_ASSIGN AssignmentExpression
        {$$ = new yy.nodes.AssignmentExpression($2, $1, $3);}
    | LambdaExpression SHL_ASSIGN AssignmentExpression
        {$$ = new yy.nodes.AssignmentExpression($2, $1, $3);}
    | LambdaExpression SHR_ASSIGN AssignmentExpression
        {$$ = new yy.nodes.AssignmentExpression($2, $1, $3);}
    | LambdaExpression AND_ASSIGN AssignmentExpression
        {$$ = new yy.nodes.AssignmentExpression($2, $1, $3);}
    | LambdaExpression XOR_ASSIGN AssignmentExpression
        {$$ = new yy.nodes.AssignmentExpression($2, $1, $3);}
    | LambdaExpression OR_ASSIGN AssignmentExpression
        {$$ = new yy.nodes.AssignmentExpression($2, $1, $3);}
    ;

LambdaExpression
    : ConditionalExpression
        {$$ = $1;}
    | '(' ')' ARROW ConditionalExpression
        {$$ = new yy.nodes.LambdaExpression([], $4);}
    | ParanthesisExpression ARROW ConditionalExpression
        {
            if (!$1.$type || $1.$type !== 'Identifier') {
                throw new Error('Lambda arguments can only be identifiers');
            }
            $$ = new yy.nodes.LambdaExpression([$1], $3);
        }
    | IDENTIFIER ARROW ConditionalExpression
        {$$ = new yy.nodes.LambdaExpression([new yy.nodes.Identifier($1)], $3);}
    | '(' LambdaParameterList ')' ARROW ConditionalExpression
        {$$ = new yy.nodes.LambdaExpression($2, $5);}
    | '(' LambdaParameterList ')' ARROW BlockStatement
        {$$ = new yy.nodes.LambdaExpression($2, $5);}
    ;

ConditionalExpression
    : LogicalOrExpression
        {$$ = $1;}
    | LogicalOrExpression '?' Expression ':' ConditionalExpression
        {$$ = new yy.nodes.ConditionalExpression($1, $3, $5);}
    ;

LogicalOrExpression
    : LogicalAndExpression
        {$$ = $1;}
    | LogicalOrExpression OR LogicalAndExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    ;
LogicalAndExpression
    : BitwiseOrExpression
        {$$ = $1;}
    | LogicalAndExpression AND BitwiseOrExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    ;
BitwiseOrExpression
    : BitwiseXorExpression
        {$$ = $1;}
    | BitwiseOrExpression '|' BitwiseXorExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    ;

BitwiseXorExpression
    : BitwiseAndExpression
        {$$ = $1;}
    | BitwiseXorExpression '^' BitwiseAndExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    ;

BitwiseAndExpression
    : EqualityExpression
        {$$ = $1;}
    | BitwiseAndExpression '&' EqualityExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    ;

EqualityExpression
    : ComparisonExpression
        {$$ = $1;}
    | EqualityExpression EQ ComparisonExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    | EqualityExpression NE ComparisonExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    ;

ComparisonExpression
    : ShiftExpression
        {$$ = $1;}
    | ComparisonExpression '<' ShiftExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    | ComparisonExpression '>' ShiftExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    | ComparisonExpression LE ShiftExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    | ComparisonExpression GE ShiftExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    ;

ShiftExpression
    : AdditiveExpression
    | ShiftExpression SHL AdditiveExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    | ShiftExpression SHR AdditiveExpression
        {$$ = new yy.nodes.BinaryExpression($2, $1, $3);}
    ;

AdditiveExpression
    : MultiplicativeExpression
        {$$ = $1;}
    | AdditiveExpression '+' MultiplicativeExpression
        {$$ = new yy.nodes.BinaryExpression($1, yy.nodes.BinaryOperator.ADD, $3);}
    | AdditiveExpression '-' MultiplicativeExpression
        {$$ = new yy.nodes.BinaryExpression($1, yy.nodes.BinaryOperator.SUB, $3);}
    ;

MultiplicativeExpression
    : PrefixExpression
        {$$ = $1;}
    | MultiplicativeExpression '*' PrefixExpression
        {$$ = new yy.nodes.BinaryExpression($1, yy.nodes.BinaryOperator.MUL, $3);}
    | MultiplicativeExpression '/' PrefixExpression
        {$$ = new yy.nodes.BinaryExpression($1, yy.nodes.BinaryOperator.DIV, $3);}
    | MultiplicativeExpression '%' PrefixExpression
        {$$ = new yy.nodes.BinaryExpression($1, yy.nodes.BinaryOperator.REM, $3);}
    ;

PrefixExpression
    : PostfixExpression
        {$$ = $1;}
    | '-' PrefixExpression
        {$$ = new yy.nodes.UnaryExpression($1, $2, true);}
    | '+' PrefixExpression
        {$$ = new yy.nodes.UnaryExpression($1, $2, true);}
    | '!' PrefixExpression
        {$$ = new yy.nodes.UnaryExpression($1, $2, true);}
    | '~' PrefixExpression
        {$$ = new yy.nodes.UnaryExpression($1, $2, true);}
    | INC PrefixExpression
        {$$ = new yy.nodes.UnaryExpression($1, $2, true);}
    | DEC PrefixExpression
        {$$ = new yy.nodes.UnaryExpression($1, $2, true);}
    ;

PostfixExpression
    : MemberExpression
        {$$ = $1;}
    | PostfixExpression INC
        {$$ = new yy.nodes.UnaryExpression($2, $1, false);}
    | PostfixExpression DEC
        {$$ = new yy.nodes.UnaryExpression($2, $1, false);}
    | PostfixExpression '(' ')'
        {$$ = new yy.nodes.CallExpression($1, []);}
    | PostfixExpression '(' CallArgumentList ')'
        {$$ = new yy.nodes.CallExpression($1, $3);}
    | BUILTIN '(' CallArgumentList ')'
        {$$ = new yy.nodes.BuiltinExpression(yy.nodes.Builtin[$1.slice(1).toUpperCase()], $3);}
    ;

MemberExpression
    : PrimaryExpression
        {$$ = $1;}
    | MemberExpression '.' IDENTIFIER
        {$$ = new yy.nodes.MemberExpression($1, $3);}
    | MemberExpression '[' Expression ']'
        {$$ = new yy.nodes.SubscriptExpression($1, $3);}
    ;

PrimaryExpression
    : LITERAL_INTEGER
        {
            $$ = new yy.nodes.LiteralExpression(
                yytext
            );
        }
    | LITERAL_DOUBLE
        {
            $$ = new yy.nodes.LiteralExpression(
                yytext
            );
        }
    | LITERAL_BOOL
        {
            $$ = new yy.nodes.LiteralExpression(
                yytext
            );
        }
    | IDENTIFIER
        {$$ = new yy.nodes.IdentifierExpression(yytext);}
    | ParanthesisExpression
        {$$ = $1;}
    | ArrayExpression
        {$$ = $1;}
    ;

ArrayExpression
    : '[' ']'
        {$$ = new yy.nodes.BracketExpression([]);}
    | '[' Expression ']'
        {$$ = new yy.nodes.BracketExpression($2);}
    | '[' ExpressionList ']'
        {$$ = new yy.nodes.BracketExpression($2);}
    ;

ParanthesisExpression
    : '(' Expression ')'
        {$$ = $2;}
    ;

ExpressionList
    : Expression ',' Expression
        {$$ = [$1, $3];}
    | ExpressionList ',' Expression
        {
            $1.push($3);
            $$ = $1;
        }
    ;

/* END Expressions */

/* Subelements for Expressions */

LambdaParameterList
    : IDENTIFIER ',' IDENTIFIER
        {
            $$ = [
                new yy.nodes.Identifier($1),
                new yy.nodes.Identifier($3)
            ];
        }
    | LambdaParameterList ',' IDENTIFIER
        {
            $1.push(new yy.nodes.Identifier($3));
            $$ = $1;
        }
    ;

CallArgumentList
    : Expression
        {$$ = [$1];}
    | CallArgumentList ',' Expression
        {
            $1.push($3);
            $$ = $1;
        }
    ;

/* END for Expressions */
