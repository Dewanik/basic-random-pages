/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * Copyright (C) 2000 Gerwin Klein <lsf@jflex.de>                          *
 * All rights reserved.                                                    *
 *                                                                         *
 * Thanks to Larry Bell and Bob Jamison for suggestions and comments.      *
 *                                                                         *
 * License: BSD                                                            *
 *                                                                         *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
 /*
 Name : Koirala, Dewanik
 CMPSC 470, Section 001
 Project 2 - Lexical Analyzer */

%%

%class Lexer
%byaccj
%unicode
%line
%column

%{

  public Parser parser;
  public int    lineno;
  public int    column;
  // Original source length of last emitted token; parser uses this for spacing.
  public int    tokenLength;

  // Stores #define aliases, e.g. aa -> int.
  private java.util.Map<String, String> defines   = new java.util.HashMap<String, String>();
  // Symbol table: identifier -> symbol id.
  private java.util.Map<String, Integer> symbols   = new java.util.LinkedHashMap<String, Integer>();
  private int                           nextSymId  = 0;

  public Lexer(java.io.Reader r, Parser parser) {
    this(r);
    this.parser = parser;
    this.lineno = 1;
    this.column = 1;
  }

  private void setPos() {
    lineno = yyline + 1;
    column = yycolumn + 1;
  }

  // Safely resolves parser token constants (works even if some constants are absent).
  private int parserConst(String name, int fallback) {
    try {
      java.lang.reflect.Field field = Parser.class.getField(name);
      return field.getInt(null);
    } catch (Exception ignored) {
      return fallback;
    }
  }

  // Generic emitter used by most token rules.
  private int emit(String parserConstName, int fallback, String attr) {
    setPos();
    tokenLength = yytext().length();
    parser.yylval = new ParserVal((Object)attr);
    return parserConst(parserConstName, fallback);
  }

  // Handles identifier token creation and first-seen symbol table insertion.
  private int emitId(String name) {
    setPos();
    tokenLength = name.length();

    Integer symId = symbols.get(name);
    boolean isNew = false;
    if (symId == null) {
      symId = Integer.valueOf(nextSymId++);
      symbols.put(name, symId);
      isNew = true;
    }

    if (isNew) {
      parser.yylval = new ParserVal((Object)("sym-id:" + symId + "|new:" + name));
    } else {
      parser.yylval = new ParserVal((Object)("sym-id:" + symId));
    }
    return parserConst("ID", parserConst("IDENT", 17));
  }

  // Emits comments as raw payload; parser prints them at exact source position.
  private int emitComment(String text) {
    setPos();
    tokenLength = text.length();
    parser.yylval = new ParserVal((Object)("__COMMENT__" + text));
    return parserConst("IDENT", 17);
  }

  // replacement text into proper token kind.
  private int emitFromDefine(String value) {
    if ("int".equals(value))   return emit("INT", parserConst("INT", 10), "int");
    if ("bool".equals(value))  return emit("BOOL", parserConst("IDENT", 17), "bool");
    if ("float".equals(value)) return emit("FLOAT", parserConst("IDENT", 17), "float");
    if ("void".equals(value))  return emit("VOID", parserConst("IDENT", 17), "void");
    if ("true".equals(value) || "false".equals(value)) {
      return emit("BOOL_VALUE", parserConst("IDENT", 17), value);
    }
    if (value.matches("[0-9]+\\.[0-9]+")) {
      return emit("FLOAT_VALUE", parserConst("INT_LIT", 16), value);
    }
    if (value.matches("[0-9]+")) {
      return emit("INT_VALUE", parserConst("INT_LIT", 16), value);
    }
    return emitId(value);
  }

  // Parses a #define line and records alias in map.
  private void saveDefine(String line) {
    String trimmed = line.trim();
    String[] parts = trimmed.split("\\s+");
    if (parts.length >= 3) {
      defines.put(parts[1], parts[2]);
    }
  }

%}

/* Basic lexical patterns */
int            = [0-9]+
float          = [0-9]+\.[0-9]+
identifier     = [A-Za-z_][A-Za-z0-9_]*
newline        = \r\n|\r|\n
whitespace     = [ \t\f]+
linecomment    = "//"[^\r\n]*
blockcomment   = "/*"([^*]|\*+[^*/])*\*+"/"
define_line    = [ \t]*"#define"[ \t]+{identifier}[ \t]+[^\r\n]+

%%

/* Preprocessor and comments */
{define_line}                        { saveDefine(yytext()); }
{linecomment}                        { return emitComment(yytext()); }
{blockcomment}                       { return emitComment(yytext()); }
{whitespace}                         { /* skip */ }
{newline}                            { /* skip */ }

/* Keywords */
"func"                              { return emit("FUNC", parserConst("IDENT", 17), yytext()); }
"var"                               { return emit("VAR", parserConst("IDENT", 17), yytext()); }
"void"                              { return emit("VOID", parserConst("IDENT", 17), yytext()); }
"bool"                              { return emit("BOOL", parserConst("IDENT", 17), yytext()); }
"int"                               { return emit("INT", parserConst("INT", 10), yytext()); }
"float"                             { return emit("FLOAT", parserConst("IDENT", 17), yytext()); }
"struct"                            { return emit("STRUCT", parserConst("IDENT", 17), yytext()); }
"size"                              { return emit("SIZE", parserConst("IDENT", 17), yytext()); }
"new"                               { return emit("NEW", parserConst("IDENT", 17), yytext()); }
"begin"                             { return emit("BEGIN", parserConst("IDENT", 17), yytext()); }
"end"                               { return emit("END", parserConst("IDENT", 17), yytext()); }
"if"                                { return emit("IF", parserConst("IDENT", 17), yytext()); }
"then"                              { return emit("THEN", parserConst("IDENT", 17), yytext()); }
"else"                              { return emit("ELSE", parserConst("IDENT", 17), yytext()); }
"while"                             { return emit("WHILE", parserConst("IDENT", 17), yytext()); }
"return"                            { return emit("RETURN", parserConst("IDENT", 17), yytext()); }
"break"                             { return emit("BREAK", parserConst("IDENT", 17), yytext()); }
"continue"                          { return emit("CONTINUE", parserConst("IDENT", 17), yytext()); }
"print"                             { return emit("PRINT", parserConst("IDENT", 17), yytext()); }

"true"|"false"                     { return emit("BOOL_VALUE", parserConst("IDENT", 17), yytext()); }

/* Delimiters and punctuation */
"("                                 { return emit("LPAREN", parserConst("LPAREN", 11), yytext()); }
")"                                 { return emit("RPAREN", parserConst("RPAREN", 12), yytext()); }
"["                                 { return emit("LBRACKET", parserConst("IDENT", 17), yytext()); }
"]"                                 { return emit("RBRACKET", parserConst("IDENT", 17), yytext()); }
":="                                { return emit("ASSIGN", parserConst("IDENT", 17), yytext()); }
"->"                                { return emit("TYPEOF", parserConst("IDENT", 17), yytext()); }
";"                                 { return emit("SEMI", parserConst("SEMI", 13), yytext()); }
","                                 { return emit("COMMA", parserConst("IDENT", 17), yytext()); }
"."                                 { return emit("DOT", parserConst("IDENT", 17), yytext()); }
"&"                                 { return emit("ADDROF", parserConst("IDENT", 17), yytext()); }
"**"                                { return emit("VALUEAT", parserConst("IDENT", 17), yytext()); }

/* Operators */
"and"|"or"|"not"                    { return emit("OP", parserConst("OP", 14), yytext()); }
"+"|"-"|"*"|"/"|"%"                 { return emit("OP", parserConst("OP", 14), yytext()); }

"<="|">="|"<>"|"="|"<"|">"           { return emit("RELOP", parserConst("RELOP", 15), yytext()); }

/* Numeric literals */
{float}                             { return emit("FLOAT_VALUE", parserConst("INT_LIT", 16), yytext()); }
{int}                               { return emit("INT_VALUE", parserConst("INT_LIT", 16), yytext()); }

/* Identifier with optional #define replacement */
{identifier}                        {
                                      String name = yytext();
                                      String macroValue = defines.get(name);
                                      if (macroValue != null) {
                                        return emitFromDefine(macroValue);
                                      }
                                      return emitId(name);
                                    }

/* Fallback lexical error */
[^]                                 {
                                      setPos();
                                      parser.printLexicalError(yytext(), lineno, column);
                                      return -1;
                                    }
\b     { System.err.println("Sorry, backspace doesn't work"); }