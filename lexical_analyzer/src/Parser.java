public class Parser
{
    public static final int INT         = 10; // "int"
    public static final int LPAREN      = 11; // "("
    public static final int RPAREN      = 12; // ")"
    public static final int SEMI        = 13; // ";"
    public static final int OP          = 14; // "+", "-", "*", "/", "and", "or", "not"
    public static final int RELOP       = 15; // "=", "!=", "<", ">", "<=", ">="
    public static final int INT_LIT     = 16; // {int}
    public static final int IDENT       = 17; // {identifier}

    public Parser(java.io.Reader r, Compiler compiler) throws Exception
    {
        this.compiler = compiler;
        this.lexer    = new Lexer(r, this);
    }

    Lexer            lexer;
    Compiler         compiler;
    public ParserVal yylval;

    // Tracks where we are in the output so whitespace matches source layout.
    private int outLine = 1;
    private int outCol  = 1;

    // Moves print cursor to a specific [line, col] by emitting spaces/newlines.
    private void moveTo(int line, int col)
    {
        while(outLine < line)
        {
            System.out.println();
            outLine++;
            outCol = 1;
        }
        while(outCol < col)
        {
            System.out.print(" ");
            outCol++;
        }
    }

    // Advances output cursor using exact source text (used by comments).
    private void advanceBySourceText(String text)
    {
        for(int i = 0; i < text.length(); i++)
        {
            char ch = text.charAt(i);
            if(ch == '\n')
            {
                outLine++;
                outCol = 1;
            }
            else
            {
                outCol++;
            }
        }
    }

    // Advances output cursor for regular tokens by original token length.
    private void advanceByTokenLength(int length)
    {
        outCol += length;
    }

    // Converts lexer token + attribute into token name.
    private String tokenName(int token, String attr)
    {
        if(token == INT)     return "INT";
        if(token == LPAREN)  return "LPAREN";
        if(token == RPAREN)  return "RPAREN";
        if(token == SEMI)    return "SEMI";
        if(token == OP)      return "OP";
        if(token == RELOP)   return "RELOP";
        if(token == INT_LIT)
            return attr.contains(".") ? "FLOAT_VALUE" : "INT_VALUE";

        if("func".equals(attr))     return "FUNC";
        if("var".equals(attr))      return "VAR";
        if("void".equals(attr))     return "VOID";
        if("bool".equals(attr))     return "BOOL";
        if("float".equals(attr))    return "FLOAT";
        if("struct".equals(attr))   return "STRUCT";
        if("size".equals(attr))     return "SIZE";
        if("new".equals(attr))      return "NEW";
        if("begin".equals(attr))    return "BEGIN";
        if("end".equals(attr))      return "END";
        if("if".equals(attr))       return "IF";
        if("then".equals(attr))     return "THEN";
        if("else".equals(attr))     return "ELSE";
        if("while".equals(attr))    return "WHILE";
        if("return".equals(attr))   return "RETURN";
        if("break".equals(attr))    return "BREAK";
        if("continue".equals(attr)) return "CONTINUE";
        if("print".equals(attr))    return "PRINT";

        if("->".equals(attr)) return "TYPEOF";
        if(":=".equals(attr)) return "ASSIGN";
        if("[".equals(attr))  return "LBRACKET";
        if("]".equals(attr))  return "RBRACKET";
        if(",".equals(attr))  return "COMMA";
        if(".".equals(attr))  return "DOT";
        if("&".equals(attr))  return "ADDROF";
        if("**".equals(attr)) return "VALUEAT";

        if("true".equals(attr) || "false".equals(attr)) return "BOOL_VALUE";
        if(attr.matches("[0-9]+\\.[0-9]+")) return "FLOAT_VALUE";
        if(attr.matches("[0-9]+")) return "INT_VALUE";

        if(attr.startsWith("sym-id:")) return "ID";
        return "ID";
    }

    // Tokens that require attr:... in output format.
    private boolean hasAttr(String name)
    {
        return "ID".equals(name)
            || "OP".equals(name)
            || "RELOP".equals(name)
            || "INT_VALUE".equals(name)
            || "FLOAT_VALUE".equals(name)
            || "BOOL_VALUE".equals(name);
    }

            //  lexical error printer to preserve position-sensitive whitespace.
    public void printLexicalError(String badChar, int line, int col)
    {
        moveTo(line, col);
        System.out.println();
        System.out.println("Lexical error: unexpected character '" + badChar + "' at " + line + ":" + col + ".");
    }

    public int yyparse() throws java.io.IOException
    {
        while ( true )
        {
            int token = lexer.yylex();
            if(token == 0)
            {
                // EOF reached successfully.
                System.out.println();
                System.out.println("Success!");
                return 0;
            }
            if(token == -1)
            {
                // A lexical error line was already printed by lexer/parser helper.
                return -1;
            }

            String rawAttr = (yylval.obj == null) ? "" : yylval.obj.toString();

            // Comments are passed from lexer as raw source text markers.
            if(rawAttr.startsWith("__COMMENT__"))
            {
                String commentText = rawAttr.substring("__COMMENT__".length());
                moveTo(lexer.lineno, lexer.column);
                System.out.print(commentText);
                advanceBySourceText(commentText);
                continue;
            }

            // For first-time symbols, lexer encodes extra metadata so parser can print
            // "<<new symbol table entity (...)>>" at the exact source position.
            String printableAttr = rawAttr;
            String newSymbolName = null;
            if(rawAttr.startsWith("sym-id:") && rawAttr.contains("|new:"))
            {
                int idx = rawAttr.indexOf("|new:");
                printableAttr = rawAttr.substring(0, idx);
                newSymbolName = rawAttr.substring(idx + 5);
            }

            moveTo(lexer.lineno, lexer.column);

            if(newSymbolName != null)
            {
                String symId = printableAttr.substring("sym-id:".length());
                System.out.print("<<new symbol table entity (" + symId + ", \"" + newSymbolName + "\")>>");
            }

            String name = tokenName(token, printableAttr);
            if(hasAttr(name))
            {
                String attrPart;
                if("ID".equals(name))
                    attrPart = printableAttr;
                else
                    attrPart = "\"" + printableAttr + "\"";

                System.out.print("<" + name + ", attr:" + attrPart + ", [" + lexer.lineno + "," + lexer.column + "]>");
            }
            else
            {
                System.out.print("<" + name + ", [" + lexer.lineno + "," + lexer.column + "]>");
            }

            advanceByTokenLength(lexer.tokenLength);
        }
    }
}
